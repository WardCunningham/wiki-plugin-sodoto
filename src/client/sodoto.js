const expand = text => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const emit = async ($item, item) => {

  const sodotoBDO = await fetch(`/plugin/sodoto/view`).then(res => res.json())
  return $item.append(`
    <div style="background-color:#eee;padding:15px;">
      ${sodotoBDO.bdo.svg}
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
