"use strict";
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
window.matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => observer.observe(element));
}
document.querySelector("#year").textContent = new Date().getFullYear();
const form = document.querySelector("#booking-form");
const dateField = document.querySelector("#date");
const timeField = document.querySelector("#time");
const serviceField = document.querySelector("#service");
const errors = document.querySelector("#form-errors");
const result = document.querySelector("#booking-result");
const serviceDetails = {
  signature: { name: "The Signature Cut", duration: 45, price: 45 },
  combo: { name: "Cut & Beard", duration: 60, price: 65 },
  beard: { name: "Beard Ritual", duration: 30, price: 30 },
  fade: { name: "The Skin Fade", duration: 45, price: 50 },
};
function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function limits() {
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + 90);
  dateField.min = localDate(today);
  dateField.max = localDate(max);
}
limits();
function hoursFor(value) {
  const day = new Date(`${value}T12:00:00`).getDay();
  return day === 1
    ? null
    : day === 6
      ? [9, 17]
      : day === 0
        ? [10, 16]
        : [10, 19];
}
function updateTimes() {
  const previous = timeField.value;
  timeField.replaceChildren(new Option("Select a time", ""));
  if (!dateField.value) {
    timeField.options[0].textContent = "Select a date first";
    return;
  }
  const hours = hoursFor(dateField.value);
  if (!hours) {
    timeField.options[0].textContent = "Closed on Mondays";
    return;
  }
  const duration = serviceDetails[serviceField.value]?.duration || 60;
  const now = new Date();
  for (
    let minutes = hours[0] * 60;
    minutes + duration <= hours[1] * 60;
    minutes += 30
  ) {
    const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    if (new Date(`${dateField.value}T${value}`) <= now) continue;
    timeField.add(new Option(value, value));
  }
  if (timeField.options.length === 1)
    timeField.options[0].textContent = "No times left — try another date";
  if ([...timeField.options].some((option) => option.value === previous))
    timeField.value = previous;
}
dateField.addEventListener("change", updateTimes);
serviceField.addEventListener("change", updateTimes);
document.querySelectorAll("[data-service]").forEach((link) =>
  link.addEventListener("click", () => {
    serviceField.value = link.dataset.service;
    updateTimes();
  }),
);
form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  result.hidden = true;
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  limits();
  updateTimes();
  const issues = [];
  const mark = (field, message) => {
    field.setAttribute("aria-invalid", "true");
    issues.push(message);
  };
  form
    .querySelectorAll("[aria-invalid]")
    .forEach((field) => field.removeAttribute("aria-invalid"));
  if (!serviceDetails[serviceField.value])
    mark(serviceField, "Choose a service.");
  if (
    !dateField.value ||
    dateField.value < dateField.min ||
    dateField.value > dateField.max
  )
    mark(dateField, "Choose a date from today through the next 90 days.");
  else if (!hoursFor(dateField.value))
    mark(
      dateField,
      "The demo studio is closed on Mondays. Please choose another day.",
    );
  if (
    !timeField.value ||
    new Date(`${dateField.value}T${timeField.value}`) <= new Date()
  )
    mark(timeField, "Choose an available future time within opening hours.");
  const name = document.querySelector("#name");
  const email = document.querySelector("#email");
  const acknowledge = document.querySelector("#acknowledge");
  if (name.value.trim().length < 2)
    mark(name, "Enter a name of at least two characters.");
  if (!email.value.trim() || !email.validity.valid)
    mark(email, "Enter a valid demo email address, such as alex@example.com.");
  if (!acknowledge.checked)
    mark(acknowledge, "Confirm that you understand this is only a demo.");
  errors.replaceChildren();
  result.hidden = true;
  if (issues.length) {
    const list = document.createElement("ul");
    issues.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      list.append(item);
    });
    errors.append(list);
    errors.hidden = false;
    errors.focus();
    return;
  }
  errors.hidden = true;
  const service = serviceDetails[serviceField.value];
  result.replaceChildren();
  const heading = document.createElement("h4");
  heading.textContent = "Your demo appointment preview";
  const summary = document.createElement("p");
  const dateLabel = new Date(`${dateField.value}T12:00:00`).toLocaleDateString(
    "en-CA",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );
  summary.textContent = `${name.value.trim()}, here’s your preview: ${service.name} · CA$${service.price} · ${service.duration} minutes · ${dateLabel} at ${timeField.value} (local time).`;
  const notice = document.createElement("p");
  notice.textContent =
    "This is not a confirmed appointment. Nothing was submitted or saved, and no email will be sent.";
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Start a new demo";
  reset.addEventListener("click", () => {
    form.reset();
    updateTimes();
    result.hidden = true;
    serviceField.focus();
  });
  result.append(heading, summary, notice, reset);
  result.hidden = false;
  result.focus();
});

form.querySelector('button[type="submit"]').disabled = false;
