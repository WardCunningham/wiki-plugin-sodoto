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

const score = (site,selected) => {
  return `<span data-site="${site}">
    <input type=checkbox name=see>
    <label for=see> seen </label>
    <input type=checkbox name=do>
    <label for=do> done </label>
    <input type=checkbox name=teach>
    <label for=teach> taught </label>
  </span>`
}

const todo = context => {
  const slug = wiki.asSlug(context.page.title)
  const have = Object.entries(wiki.neighborhoodObject.sites)
    .filter(([domain, site]) => !site.sitemapRequestInflight && site.sitemap)
    .filter(([domain, site]) => site.sitemap.find(info => info.slug == slug))
    .map(([domain, site]) => domain)
    .filter(domain => domain != context.owner)
  const details = have.map(site => `
    &nbsp; <img class='remote' src='${wiki.site(site).flag()}'
    title='${site}' data-site="${site}" data-slug="${slug}">
    ${score(site,[])}`).join("<br>")
  return have.length
    ? `<details><summary>${have.length} students</summary>
      ${details}
      </details>`
    : ""
}

const emit = ($item, item) => {
  const context = localize($item,item)
  const teacher = context.teacher
  let confs = null
  if(teacher) confs = wiki.site(teacher).get(asSlug(item.title)).story.find(each => each.id==item.id)
  console.log({context,confs})
  return $item.append(`
    <div style="background-color:#eee;padding:15px;">
      <b>${expand(context.lesson)}</b><br>
      ${score('me',[])}
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
    bind($item,item)
  })
  $item.on('change', event => {
    event.preventDefault()
    event.stopPropagation()
    const target = event.target
    const name = target.name
    const active = target.checked
    const disabled = target.disabled
    // const site = target.closest('span').dataset.site
    const span = target.closest('span')
    const site = span.dataset.site
    console.log({event,target,name,active,disabled,span,site})
    return true
  })
}

if (typeof window !== 'undefined') {
  window.plugins.sodoto = { emit, bind }
}

export const sodoto = typeof window == 'undefined' ? { expand } : undefined
