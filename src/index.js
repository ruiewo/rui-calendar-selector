const ui = (() => {
  function getCalendars() {
    const [myList, otherList] = document.querySelectorAll(`[role="list"]`)
    return [...myList.children, ...otherList.children]
  }

  function updateCalendarState(activeList = []) {
    for (const dom of getCalendars()) {
      const state = activeList.includes(dom.querySelector('span').textContent)
      const checkbox = dom.querySelector('input')
      if (state !== checkbox.checked) {
        checkbox.click()
      }
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

    const li = document.createElement('li')
    li.classList.add('addRow')
    const addButton = document.createElement('div')
    addButton.classList.add('addButton')
    addButton.textContent = '+Add'
    addButton.onclick = addGroup
    li.appendChild(addButton)
    ul.appendChild(li)

    const header = document.createElement('div')
    header.textContent = `Calendar Group`
    header.classList.add('rui-header')

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

  return { render }
})()

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

async function main() {
  await ui.render(true)
}

main()
