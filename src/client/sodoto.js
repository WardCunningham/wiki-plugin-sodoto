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
  const lesson = item.text.trim().split(/\n/)[0].trim()
  if ('forward' in item) delete item.forward
  console.log({lesson,owner,item,page})
  if (item.title != page.title) {
    item.title = page.title
    item.students = {}
  }
  return {$item, item, owner, page, lesson}  
}

const score = (site,assessment) => {
  return `<span data-site="${site}">
    <input type=checkbox name=see ${assessment.see ? 'checked' : ''}>
    <label for=see> seen </label>
    <input type=checkbox name=do ${assessment.do ? 'checked' : ''}>
    <label for=do> done </label>
    <input type=checkbox name=teach ${assessment.teach ? 'checked' : ''}>
    <label for=teach> taught </label>
  </span>`
}

const doing = context => {
  const slug = wiki.asSlug(context.page.title)
  const have = Object.entries(context.item?.students ?? {})
  const details = have.map(([site, assessment]) => `
    &nbsp; <img class='remote' src='${wiki.site(site).flag()}'
    title='${site}' data-site="${site}" data-slug="${slug}">
    ${score(site,assessment)}`).join("<br>")
  return have.length
    ? `<details><summary>${have.length} students</summary>
      ${details}
      </details>`
    : ""
}

const cando = context => {
  const slug = wiki.asSlug(context.page.title)
  const have = Object.entries(wiki.neighborhoodObject.sites)
    .filter(([domain, site]) => !site.sitemapRequestInflight && site.sitemap)
    .filter(([domain, site]) => site.sitemap.find(info => info.slug == slug))
    .map(([domain, site]) => domain)
    .filter(domain => domain != context.owner)
    .filter(domain => !(domain in (context.item?.students ?? {})))
  const details = have.map(site => `
    &nbsp; <img class='remote' src='${wiki.site(site).flag()}'
    title='${site}' data-site="${site}" data-slug="${slug}">
    ${score(site,context.item?.students?.[site] ?? {} )}`).join("<br>")
  return have.length
    ? `<details><summary>${have.length} others</summary>
      ${details}
      </details>`
    : ""
}

const emit = ($item, item) => {
  const context = localize($item,item)
  const teacher = context.teacher
  let confs = null
  if(teacher) confs = wiki.site(teacher).get(asSlug(item.title)).story.find(each => each.id==item.id)
  return $item.append(`
    <div style="background-color:#eee;padding:15px;">
      <b>${expand(context.lesson)}</b><br>
      ${score('me',item.assessment ?? {})}
      ${doing(context)}
      ${cando(context)}
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
    if(site=='me') {
      if(!('assessment' in item)) item.assessment = {}
      item.assessment[name] = active
    } else {
      if(!('students' in item)) item.students = {}
      if(!(site in item.students)) item.students[site] = {}
      item.students[site][name] = active
    }
    wiki.pageHandler.put($item.parents('.page:first'), {
      type: 'edit',
      id: item.id,
      item: item,
    })
    return true
  })
}

if (typeof window !== 'undefined') {
  window.plugins.sodoto = { emit, bind }
}

export const sodoto = typeof window == 'undefined' ? { expand } : undefined
