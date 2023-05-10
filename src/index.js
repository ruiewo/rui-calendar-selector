console.log('-----------rui-calendar-selector start-----------');

async function main() {
  const calendarDiv =
    document.querySelector('[jsname="Hostde"]')?.parentElement;
  calendarDiv.parentNode.insertBefore(await createSelect(), calendarDiv);
}

function updateCalendarState(list = ['Toshiaki Wada', 'ToDo リスト']) {
  console.log('start!!!');
  const { myCalendars, otherCalendars } = getCalendars();

  for (const [name, dom] of myCalendars) {
    setState(dom, list.includes(name));
  }

  for (const [name, dom] of otherCalendars) {
    setState(dom, list.includes(name));
  }
}

function getCalendars() {
  const wrapper = document.querySelector('div[role="complementary"]');
  const [myList, otherList] = document.querySelectorAll(`[role="list"]`);
  const myCalendarDoms = myList.children;
  const otherCalendarDoms = otherList.children;
  const myCalendars = new Map();
  for (const cal of myCalendarDoms) {
    myCalendars.set(cal.querySelector('span').textContent, cal);
  }

  const otherCalendars = new Map();
  for (const cal of otherCalendarDoms) {
    otherCalendars.set(cal.querySelector('span').textContent, cal);
  }

  return { myCalendars, otherCalendars };
}

function setState(calendar, state) {
  const checkbox = calendar.querySelector('input');
  if (state !== checkbox.checked) {
    checkbox.click();
  }
}

function getState(calendar) {
  return calendar.querySelector('input').checked;
}

async function createSelect() {
  const groups = await storage.getGroups();

  const ul = document.createElement('ul');
  ul.classList.add('rui-calendar');
  for (const { label, list } of groups) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = label;
    span.onclick = () => updateCalendarState(list);

    const button = document.createElement('div');
    button.classList.add('deleteButton');
    button.onclick = () => console.log(label);

    li.appendChild(span);
    li.appendChild(button);

    ul.appendChild(li);
  }

  const header = document.createElement('div');
  header.textContent = `Calendar Group`;
  header.classList.add('rui-header');

  const wrapper = document.createElement('div');
  wrapper.appendChild(header);
  wrapper.appendChild(ul);

  return wrapper;
}

const storage = (() => {
  const calendarGroupKey = 'calendarGroupKey';
  async function getGroups() {
    // const data = await chrome.storage.sync.get(calendarGroupKey);
    // return data[calendarGroupKey];

    const groups = [
      { label: 'hoge', list: ['sample1', 'sample2'] },
      { label: 'hoge2', list: ['sample2', 'sample3'] },
    ];

    return groups;
  }

  async function saveGroups(list) {
    await chrome.storage.sync.set({ [calendarGroupKey]: list });
  }

  return {
    getGroups,
    saveGroups,
  };
})();

main();
