const employeeNameInput = document.getElementById("employeeName");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const addVacationBtn = document.getElementById("addVacation");
const calendarEl = document.getElementById("calendar");
const monthTitleEl = document.getElementById("monthTitle");
const vacationListEl = document.getElementById("vacationList");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

let vacations = JSON.parse(localStorage.getItem("vacations")) || [];

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

function saveData() {
  localStorage.setItem("vacations", JSON.stringify(vacations));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateInRange(dayDate, from, to) {
  const day = normalizeDate(dayDate);
  const start = normalizeDate(new Date(from));
  const end = normalizeDate(new Date(to));

  return day >= start && day <= end;
}

function getVacationsForDay(dayDate) {
  return vacations.filter(vacation =>
    isDateInRange(dayDate, vacation.from, vacation.to)
  );
}

function renderCalendar() {
  calendarEl.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitleEl.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startWeekDay = firstDay.getDay();
  if (startWeekDay === 0) startWeekDay = 7;

  for (let i = 1; i < startWeekDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day empty";
    calendarEl.appendChild(emptyCell);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayDate = new Date(year, month, day);
    const dayVacations = getVacationsForDay(dayDate);

    const dayCell = document.createElement("div");
    dayCell.className = "day";

    if (dayVacations.length > 1) {
      dayCell.classList.add("overlap");
    }

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    dayVacations.forEach(vacation => {
      const tag = document.createElement("div");
      tag.className = "vacation-tag";
      tag.textContent = vacation.name;
      tag.title = `${vacation.name}: ${formatDate(vacation.from)} — ${formatDate(vacation.to)}`;
      dayCell.appendChild(tag);
    });

    calendarEl.appendChild(dayCell);
  }
}

function renderVacationList() {
  vacationListEl.innerHTML = "";

  if (vacations.length === 0) {
    vacationListEl.innerHTML = "<p>Пока отпусков нет.</p>";
    return;
  }

  vacations.forEach(vacation => {
    const item = document.createElement("div");
    item.className = "vacation-item";

    item.innerHTML = `
      <div>
        <strong>${vacation.name}</strong>
        <span>${formatDate(vacation.from)} — ${formatDate(vacation.to)}</span>
      </div>
      <button class="delete-btn" onclick="deleteVacation('${vacation.id}')">Удалить</button>
    `;

    vacationListEl.appendChild(item);
  });
}

function addVacation() {
  const name = employeeNameInput.value.trim();
  const from = dateFromInput.value;
  const to = dateToInput.value;

  if (!name || !from || !to) {
    alert("Заполни имя сотрудника и даты отпуска.");
    return;
  }

  if (new Date(from) > new Date(to)) {
    alert("Дата начала не может быть позже даты окончания.");
    return;
  }

  vacations.push({
    id: crypto.randomUUID(),
    name,
    from,
    to
  });

  saveData();

  employeeNameInput.value = "";
  dateFromInput.value = "";
  dateToInput.value = "";

  renderCalendar();
  renderVacationList();
}

function deleteVacation(id) {
  vacations = vacations.filter(vacation => vacation.id !== id);
  saveData();
  renderCalendar();
  renderVacationList();
}

addVacationBtn.addEventListener("click", addVacation);

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
renderVacationList();
