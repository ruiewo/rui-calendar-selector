console.log('-----------rui-calendar-selector start-----------')

async function main() {
  await render(true)
}

function getCalendars() {
  const [myList, otherList] = document.querySelectorAll(`[role="list"]`)
  return [...myList.children, ...otherList.children]
}

function updateCalendarState(list = []) {
  for (const dom of getCalendars()) {
    setState(dom, list.includes(dom.querySelector('span').textContent))
  }
}

function getActiveCalendars() {
  const activeList = []
  for (const cal of getCalendars()) {
    if (cal.querySelector('input').checked) {
      activeList.push(cal.querySelector('span').textContent)
    }
  }

  return activeList
}

function setState(calendar, state) {
  const checkbox = calendar.querySelector('input')
  if (state !== checkbox.checked) {
    checkbox.click()
  }
}

async function render(isInit = false) {
  const groups = await storage.getGroups()

  const ul = document.createElement('ul')
  ul.classList.add('rui-groups')
  for (const { groupName, list } of groups) {
    const li = document.createElement('li')

    const span = document.createElement('span')
    span.textContent = groupName
    span.onclick = () => updateCalendarState(list)

    const button = document.createElement('div')
    button.classList.add('deleteButton')
    button.onclick = () => deleteGroup(groupName)

    li.appendChild(span)
    li.appendChild(button)

    ul.appendChild(li)
  }
  const addButton = document.createElement('li')
  addButton.classList.add('addButton')
  addButton.textContent = 'save as'
  addButton.onclick = addGroup
  ul.appendChild(addButton)

  const header = document.createElement('div')
  header.textContent = `Calendar Group`
  header.classList.add('rui-header')

  let wrapper
  if (isInit) {
    wrapper = document.createElement('div')
    wrapper.id = 'rui-calendar-selector'
  } else {
    wrapper = document.getElementById('rui-calendar-selector')
    wrapper.replaceChildren()
  }
  wrapper.appendChild(header)
  wrapper.appendChild(ul)

  if (isInit) {
    const wrapper = document.createElement('div')
    wrapper.id = 'rui-calendar-selector'
    wrapper.appendChild(header)
    wrapper.appendChild(ul)

    const calendarDiv = document.querySelector('[jsname="Hostde"]').parentElement
    calendarDiv.parentNode.insertBefore(wrapper, calendarDiv)
  } else {
    const wrapper = document.getElementById('rui-calendar-selector')
    wrapper.replaceChildren()
    wrapper.appendChild(header)
    wrapper.appendChild(ul)
  }
}

async function addGroup() {
  const groupName = window.prompt('Please enter a group name.')
  if (groupName) {
    await storage.addGroup(groupName, getActiveCalendars())
  }
  await render()
}

async function deleteGroup(groupName) {
  await storage.deleteGroup(groupName, getActiveCalendars())
  await render()
}

const storage = (() => {
  const calendarGroupKey = 'calendarGroupKey'

  async function getGroups() {
    const data = await chrome.storage.sync.get(calendarGroupKey)
    return data[calendarGroupKey]
  }

  async function addGroup(groupName, list) {
    const groups = await getGroups()
    groups.push({ groupName, list })

    await saveGroups(groups)
  }

  async function deleteGroup(deleteGroupName) {
    const groups = await getGroups()
    await saveGroups(groups.filter(({ groupName }) => groupName !== deleteGroupName))
  }

  async function saveGroups(groups) {
    await chrome.storage.sync.set({ [calendarGroupKey]: groups })
  }

  return {
    getGroups,
    addGroup,
    deleteGroup,
  }
})()

main()
