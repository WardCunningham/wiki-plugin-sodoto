const expand = text => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const emit = async ($item, item) => {
  // throw new Error ("Can you hear me now?")

  const payload = {
    item:{
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
