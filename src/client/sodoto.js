const expand = text => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const localize = ($item,item) => {
  const $page = $item.parents('.page')
  const owner = $page.data('site') || location.host
  const page = $page.data('data')
  if (item.title != page.title) {
    item.title = page.title
    item.forward = []
  }
  const lesson = item.text.trim()
  return {$item, item, owner, page, lesson}  
}

const score = checks => {
  return `<div>
    <input type=checkbox name=see>
    <label for=see> seen </label>
    <input type=checkbox name=do>
    <label for=do> done </label>
    <input type=checkbox name=teach>
    <label for=teach> taught </label>
  </div>`
}

const todo = context => {
  const slug = wiki.asSlug(context.page.title)
  console.log(Object.entries(wiki.neighborhoodObject.sites))
  const have = Object.entries(wiki.neighborhoodObject.sites)
    .filter(([domain, site]) => !site.sitemapRequestInflight && site.sitemap)
    .filter(([domain, site]) => site.sitemap.find(info => info.slug == slug))
    .map(([domain, site]) => domain)
    .filter(domain => domain != context.owner)
  console.log({have})
  return have
    .map(domain => `
      <br><img width=16px src="//${domain}/favicon.png"> ${domain}
      <br>${score(0)}`)
    .join("")
}

const emit = ($item, item) => {
  const context = localize($item,item)
  console.log(context)
  return $item.append(`
    <div style="background-color:#eee;padding:15px;">
      <b>${expand(context.lesson)}</b><br>
      ${score(0)}
      ${todo(context)}
    </div>`)
}

const bind = ($item, item) => {
  $item.dblclick(() => {
    item = localize($item,item).item
    return wiki.textEditor($item, item)
  })
  $('body').on('new-neighbor-done', (e, site) => {
    $item.empty()
    emit($item, item)
  })
}

if (typeof window !== 'undefined') {
  window.plugins.sodoto = { emit, bind }
}

export const sodoto = typeof window == 'undefined' ? { expand } : undefined
