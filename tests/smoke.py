"""Run with a server at localhost:8000 and Python Playwright + Chromium installed."""
from datetime import datetime, timedelta
import os
BASE_URL = os.environ.get("STUDIO_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page()
    failures = []
    page.on('pageerror', lambda error: failures.append(str(error)))
    for width, height in [(320,740),(360,800),(390,844),(768,1024),(1024,768),(1440,1000),(1920,1080)]:
        page.set_viewport_size({'width':width,'height':height})
        page.goto(BASE_URL + '/', wait_until='networkidle')
        assert page.title().startswith('THE CUT STUDIO')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}'
        assert page.locator('h1').inner_text() == 'Look Sharp.\nFeel Confident.'
        if width <= 800:
            page.locator('.menu-toggle').click()
            assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'true'
            page.keyboard.press('Escape')
            assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'false'
            page.locator('.menu-toggle').click()
            page.locator('#navigation a[href="#services"]').click()
            assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'false'
        print(f'PASS responsive layout + navigation: {width}×{height}')
    # Every on-page link should actually navigate to its target.
    for link in page.locator('a[href^="#"]').all():
        href = link.get_attribute('href')
        link.focus()
        link.click()
        page.wait_for_function('(hash) => location.hash === hash', arg=href)
        if link.get_attribute('data-service'):
            assert page.locator('#service').input_value() == link.get_attribute('data-service')
    page.locator('#booking-form').evaluate('(form) => form.reset()')
    print('PASS every on-page link and all four service buttons')
    page.locator('#booking-form button[type=submit]').click()
    assert page.locator('#form-errors').is_visible()
    assert page.locator('#form-errors li').count() == 6
    page.select_option('#service', 'combo')
    day = datetime.now() + timedelta(days=1)
    while day.weekday() == 0: day += timedelta(days=1)
    page.fill('#date', day.strftime('%Y-%m-%d'))
    page.locator('#date').dispatch_event('change')
    page.select_option('#time', index=1)
    page.fill('#name', '<script>alert("test")</script>')
    page.fill('#email', 'invalid')
    page.check('#acknowledge')
    page.locator('#booking-form button[type=submit]').click()
    assert page.locator('#form-errors').is_visible()
    assert page.locator('#email').get_attribute('aria-invalid') == 'true'
    page.fill('#email', 'alex@example.com')
    requests = []
    page.on('request', lambda req: requests.append(req.method))
    page.locator('#booking-form button[type=submit]').click()
    assert page.locator('#booking-result').is_visible()
    assert 'Demo only — no appointment booked' in page.locator('#booking-result').inner_text()
    assert 'Nothing was submitted or saved' in page.locator('#booking-result').inner_text()
    assert '<script>' in page.locator('#booking-result').inner_text()
    assert page.locator('#booking-result script').count() == 0
    assert 'POST' not in requests
    assert page.evaluate('localStorage.length') == 0
    assert page.evaluate('sessionStorage.length') == 0
    page.locator('#booking-result button').click()
    assert page.locator('#booking-result').is_hidden()
    assert page.locator('#name').input_value() == ''
    monday = datetime.now() + timedelta(days=1)
    while monday.weekday() != 0: monday += timedelta(days=1)
    page.fill('#date', monday.strftime('%Y-%m-%d'))
    page.locator('#date').dispatch_event('change')
    assert 'Closed on Mondays' in page.locator('#time').inner_text()
    print('PASS validation, Monday closure, safe rendering, local-only preview, reset')
    assert not failures, failures
    print('PASS no JavaScript errors')
    page.set_viewport_size({'width':1440,'height':1000})
    page.goto(BASE_URL + '/', wait_until='networkidle')
    page.emulate_media(reduced_motion='reduce')
    for image in page.locator('img').all():
        image.scroll_into_view_if_needed()
        image.evaluate('(image) => image.decode()')
        assert image.evaluate('(image) => image.naturalWidth > 0')
    assert page.evaluate('''[...document.querySelectorAll('a[href^="#"]')].every(a=>document.querySelector(a.getAttribute('href')))''')
    page.goto(BASE_URL + '/credits.html', wait_until='networkidle')
    assert 'AI-generated' in page.locator('main').inner_text()
    page.locator('a.button').click()
    page.wait_for_url(BASE_URL + '/')
    print('PASS image-credits return button')
    page.locator('img').evaluate_all("images => images.forEach(img => img.loading = 'eager')")
    page.evaluate('Promise.all([...document.images].map(img => img.decode()))')
    print('PASS all images decode, internal links resolve, credits load')
    page.screenshot(path='/tmp/cut-studio-desktop.png', full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path='/tmp/cut-studio-mobile.png', full_page=True)
    no_js = browser.new_page(java_script_enabled=False)
    no_js.goto(BASE_URL + '/')
    assert no_js.locator('button[type=submit]').is_disabled()
    assert no_js.locator('noscript').is_visible()
    print('PASS without JavaScript: content available, booking safely disabled')
    browser.close()
