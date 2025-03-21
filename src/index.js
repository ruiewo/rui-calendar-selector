const ui = (() => {
  function getCalendars() {
    const [myList, otherList] = document.querySelectorAll(`[role="list"]`)
    return [...myList.querySelectorAll('input[aria-label]'), ...otherList.querySelectorAll('input[aria-label]')]
  }

  function checkCalendars(activeList) {
    getCalendars().forEach((input) => {
      const state = activeList.includes(input.getAttribute('aria-label'))
      if (state !== input.checked) {
        input.click()
      }
    })
  }

  async function updateCalendarState(activeList) {
    const sidebarRoot = getSidebarRoot()
    let canScroll = true

    do {
      checkCalendars(activeList)
      canScroll = await scroll(sidebarRoot)
    } while (canScroll)
  }

  function getActiveCalendars() {
    return getCalendars()
      .filter((x) => x.checked)
      .map((x) => x.getAttribute('aria-label'))
  }

  function getSidebarRoot() {
    return document.querySelector('h1').closest('div')
  }

  async function scroll(element) {
    const visibleHeight = element.scrollTop + element.clientHeight
    const canScroll = Math.abs(element.scrollHeight - visibleHeight) > 10

    if (canScroll) {
      element.scroll({ top: visibleHeight, behavior: 'smooth' })
      await sleep(300)
    }

    return canScroll
  }

  async function addGroup() {
    const groupName = window.prompt('Please enter a group name.')
    if (groupName) {
      await storage.addGroup(groupName, getActiveCalendars())
    }
    await render()
  }

  async function deleteGroup(groupName) {
    await storage.deleteGroup(groupName)
    await render()
  }

  async function render(isInit = false) {
    const groups = await storage.getGroups()

    const ul = document.createElement('ul')
    ul.classList.add('rui-groups')
    for (const { groupName, list } of groups) {
      const li = htmlToNode('<li><span></span><div class="deleteButton"></div></li>')
      li.onclick = (e) => {
        if (e.target.closest('.deleteButton')) {
          deleteGroup(groupName)
        } else {
          updateCalendarState(list)
        }
      }

      li.querySelector('span').textContent = groupName
      ul.appendChild(li)
    }

    const li = htmlToNode('<li class="addRow"><div class="addButton">+Add</div></li>')
    li.querySelector('.addButton').onclick = addGroup
    ul.appendChild(li)

    const header = htmlToNode('<div class="rui-header">Calendar Group</div>')

    if (isInit) {
      const wrapper = htmlToNode('<div id="rui-calendar-selector"></div>')
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
    return data[calendarGroupKey] ?? []
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

const htmlToNode = (html) => {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstChild
}

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

async function main() {
  await ui.render(true)
}

main()
