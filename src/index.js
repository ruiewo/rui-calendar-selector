console.log('-----------rui-calendar-selector start-----------');

if (true) {
  const panel = document.createElement('div');
  panel.classList.add('micraperPanel');

  const selectButton = document.createElement('button');
  selectButton.textContent = '選択！';
  selectButton.onclick = (e) => {
    // e.stopPropagation();
    // document.body.classList.add('micraper');
    // document.body.addEventListener('click', select);
    select();
  };
  panel.appendChild(selectButton);
  const description1 = document.createElement('p');
  description1.innerHTML = 'output console<br>';
  panel.appendChild(description1);

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.onclick = (e) => {
    panel.remove();
  };
  panel.appendChild(closeButton);

  document.body.appendChild(panel);
}

function select() {
  console.log('start!!!');
  const { myCalendars, otherCalendars } = getCalendars();
  // const list = storage.getList();
  const list = ['Toshiaki Wada', 'ToDo リスト'];
  console.log(myCalendars);

  for (const [name, dom] of myCalendars) {
    // console.log(name, list.includes(name), `[${name}]`);
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

function createSelect() {
  //
  // const list = storage.getList();
  const calendarNames = [
    { label: 'hoge', list: ['Toshiaki Wada', 'ToDo リスト'] },
    { label: 'hoge2', list: ['Toshiaki Wada', 'ToDo リスト'] },
  ];

  let html = `<ul>`;
  for (const { label, list } of calendarNames) {
    html += `<li><span>${label}</span><button>delete</button></li>`;
  }
  html += `</ul>`;
}

const storage = (() => {
  //
  const listKey = 'listKey';
  async function getList() {
    const data = await chrome.storage.sync.get(listKey);

    return data[listKey];
  }

  async function saveList(list) {
    await chrome.storage.sync.set({ [listKey]: list });
  }

  return {
    getList,
    saveList,
  };
})();
