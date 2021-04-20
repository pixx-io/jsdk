export function enableEcommerce() {
  if (typeof ga !== 'undefined' && ga) {
    ga('require', 'ecommerce');
  }
}

export function trackTransaction(transactionId) {
  if (typeof ga !== 'undefined' && ga) {
    ga('ecommerce:addTransaction', {
      'id': transactionId
    });
    ga('ecommerce:send');
  }
}

export function getAnalytics() {

  function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ')
    c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0)
    return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  const analyticsRaw = readCookie('_px_analytics');
  let pAnalytics = {};
  if (analyticsRaw) {
    const p = JSON.parse(analyticsRaw);
    const f = p.visitorFirst;
    const l = p.visitorLast;

    pAnalytics = {
      // first
      pixxio_analytics_1st_utm_source: f.utm_source || '',
      pixxio_analytics_1st_utm_medium: f.utm_medium  || '',
      pixxio_analytics_1st_utm_content: f.utm_content || '',
      pixxio_analytics_1st_utm_campaign: f.utm_campaign || '',
      pixxio_analytics_1st_date: f.date || '',
      pixxio_analytics_1st_appname: f.userAgent || '',
      pixxio_analytics_1st_device: f.device || '',
      pixxio_analytics_1st_hostname: f.geo.hostname || '',
      pixxio_analytics_1st_loc: f.geo.loc || '',
      pixxio_analytics_1st_postal: f.geo.postal || '',
      pixxio_analytics_1st_timezone: f.geo.timezone || '',
      pixxio_analytics_1st_city: f.geo.city || '',
      pixxio_analytics_1st_region: f.geo.region || '',
      pixxio_analytics_1st_country: f.geo.country || '',
      pixxio_analytics_1st_language: f.utm_source || '',
      pixxio_analytics_1st_platform: f.utm_source || '',
      pixxio_analytics_1st_campaignid: f.campaignid || '',
      pixxio_analytics_1st_adgroupid: f.adgroupid || '',
      pixxio_analytics_1st_feeditemid: f.feeditemid || '',
      pixxio_analytics_1st_network: f.network || '',
      pixxio_analytics_1st_google_click_id: f.gclid || '',
      pixxio_analytics_1st_creative: f.creative || '',
      pixxio_analytics_1st_keyword: f.keyword || '',
      pixxio_analytics_1st_placement: f.placement || '',
      pixxio_analytics_1st_adposition: f.adposition || '',
      // last
      pixxio_analytics_last_utm_source: l.utm_source || '',
      pixxio_analytics_last_utm_medium: l.utm_medium || '',
      pixxio_analytics_last_utm_content: l.utm_content || '',
      pixxio_analytics_last_utm_campaign: l.utm_campaign || '',
      pixxio_analytics_last_date: l.date || '',
      pixxio_analytics_last_appname: l.userAgent || '',
      pixxio_analytics_last_device: l.device || '',
      pixxio_analytics_last_hostname: l.geo.hostname || '',
      pixxio_analytics_last_loc: l.geo.loc || '',
      pixxio_analytics_last_postal: l.geo.postal || '',
      pixxio_analytics_last_timezone: l.geo.timezone || '',
      pixxio_analytics_last_city: l.geo.city || '',
      pixxio_analytics_last_region: l.geo.region || '',
      pixxio_analytics_last_country: l.geo.country || '',
      pixxio_analytics_last_language: l.utm_source || '',
      pixxio_analytics_last_platform: l.utm_source || '',
      pixxio_analytics_last_campaignid: l.campaignid || '',
      pixxio_analytics_last_adgroupid: l.adgroupid || '',
      pixxio_analytics_last_feeditemid: l.feeditemid || '',
      pixxio_analytics_last_network: l.network || '',
      pixxio_analytics_last_google_click_id: l.gclid || '',
      pixxio_analytics_last_creative: l.creative || '',
      pixxio_analytics_last_keyword: l.keyword || '',
      pixxio_analytics_last_placement: l.placement || '',
      pixxio_analytics_last_adposition: l.adposition || '',
    }
  }

  const utmzzRaw = readCookie('__utmzz');
  let uAnalytics = {};
  if (utmzzRaw) {
    const utmzz = utmzzRaw.split('|');

    uAnalytics = {
      pixxio_analytics_js_ga_source: utmzz[0] ? utmzz[0].replace('utmcsr=', '') : '',
      pixxio_analytics_js_ga_medium: utmzz[1] ? utmzz[1].replace('utmcmd=', '') : '',
      pixxio_analytics_js_ga_campaign: utmzz[2] ? utmzz[2].replace('utmccn=', '') : '',
      pixxio_analytics_js_referrer: utmzz[3] ? utmzz[3].replace('utmctr=', '') : '',
    }
  }

  return {
    ...pAnalytics,
    ...uAnalytics
  }
}

export function track(path) {
  if (typeof ga !== 'undefined' && ga) {
    ga('send', 'pageview', path)
  }
}