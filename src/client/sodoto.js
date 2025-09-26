const expand = text => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const payload = ($item, item, text = null) => {
  const $page = $item.parents('.page')
  const site = $page.data('site') || location.hostname
  const page = wiki.lineup.atKey($page.get(0).dataset.key).getRawPage()
  return {
    item: {
      site,
      title: page.title,
      text: text || item.text,
      id: item.id,
    },
  }
}

const content = async payload => {
  const view = '/plugin/sodoto/view'
  const res = await fetch(`${view}?payload=${btoa(JSON.stringify(payload))}`)
  if (!res.ok) return res.statusText + '<br>' + (await res.text())
  const json = await res.json()
  const bdo = json.bdo
  const svg = bdo.svgContent || bdo.svg
  return bdo.svgContent || bdo.svg
}

const debug = $item => {
  const spells = $item.get(0).querySelectorAll('[spell]')
  const components = [...spells].map(e => JSON.parse(e.getAttribute('spell-components')))
  console.log({ components })
}

const emit = async ($item, item) => {
  $item.append(`
    <div style="background-color:#eee;padding:15px;">
      ${await content(payload($item, item))}
    </div>`)
  debug($item)
}

const bind = ($item, item) => {
  $item.dblclick(() => {
    return wiki.textEditor($item, item)
  })

  const reemit = async text => {
    $item.append(`
      <div style="background-color:#eee;padding:15px;">
        ${await content(payload($item, item, text))}
      </div>`)
    debug($item)
  }

  const rebind = () => {
    const spells = $item.get(0).querySelectorAll('[spell]')
    for (const spell of spells) {
      spell.addEventListener('click', elem => {
        const target = event.target
        const components = JSON.parse(target.getAttribute('spell-components'))
        const bdoPubKey = components.bdoPubKey
        console.log({ target, components, bdoPubKey })
        $item.empty()
        reemit(`Handling advance to new state.\n${bdoPubKey}`).then(rebind())
      })
    }
  }

  rebind()
}

if (typeof window !== 'undefined') {
  window.plugins.sodoto = { emit, bind }
}
export const sodoto = typeof window == 'undefined' ? { expand } : undefined
