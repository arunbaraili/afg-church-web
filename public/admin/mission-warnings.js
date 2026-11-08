(() => {
  const cms = window.CMS;
  if (!cms?.registerEventListener) return;

  cms.registerEventListener({
    name: 'preSave',
    handler: ({ entry }) => {
      if (entry.get('path') !== 'src/content/site/mission.json') return;
      const stories = entry.getIn(['data', 'items'])?.toJS() ?? [];
      const missing = [];
      const blank = value => typeof value !== 'string' || !value.trim();
      stories.forEach((story, index) => {
        const fields = [];
        if (blank(story.location)) fields.push('location');
        if (blank(story.body)) fields.push('introduction');
        if (blank(story.image)) fields.push('cover image');
        else if (blank(story.imageAlt)) fields.push('cover image description');
        if (story.gallery?.some(photo => blank(photo.image) || blank(photo.alt))) fields.push('gallery photo or description');
        if (story.sections?.some(section => blank(section.title) || blank(section.body))) fields.push('section heading or text');
        if (fields.length) missing.push(`${story.title || `Mission ${index + 1}`}: ${fields.join(', ')}`);
      });

      document.getElementById('mission-save-notice')?.remove();
      if (!missing.length) return;
      const notice = document.createElement('aside');
      notice.id = 'mission-save-notice';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:10000;max-width:min(440px,calc(100% - 32px));max-height:50vh;overflow:auto;background:#fff8e8;color:#2a210f;border:1px solid #ad812d;padding:16px;border-radius:8px;font:14px/1.5 system-ui';
      const message = document.createElement('p');
      message.textContent = `Some optional mission fields are blank. Saving can continue. ${missing.join('; ')}.`;
      const dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.textContent = 'Dismiss';
      dismiss.addEventListener('click', () => notice.remove());
      notice.append(message, dismiss);
      document.body.append(notice);
    },
  });
})();
