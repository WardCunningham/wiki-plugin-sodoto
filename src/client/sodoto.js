const expand = text => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const emit = async ($item, item) => {
  // throw new Error ("Can you hear me now?")

  const $page = $item.parents('.page')
  const site = $page.data('site') || location.hostname
  // const page = $page.data('data')
  const page = wiki.lineup.atKey($page.get(0).dataset.key).getRawPage()

  const payload = {
    item:{
      site,
      title:page.title,
      text:item.text,
      id:item.id
    }
  }

  const res = await fetch(`/plugin/sodoto/view?payload=${btoa(JSON.stringify(payload))}`)
  return $item.append(`
    <div style="background-color:#eee;padding:15px;">
      ${res.ok ? (await res.json()).bdo.svg : res.statusText + '<br>' + (await res.text())}
    </div>`)
}

const bind = ($item, item) => {
  $item.dblclick(() => {
    return wiki.textEditor($item, item)
  })
}

if (typeof window !== 'undefined') {
  window.plugins.sodoto = { emit, bind }
}
export const sodoto = typeof window == 'undefined' ? { expand } : undefined
