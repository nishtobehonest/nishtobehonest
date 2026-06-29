/* Theme toggle — light (default) / dark */

(function () {
  var STORAGE_KEY = 'nish-theme';

  function currentTheme() {
    return document.documentElement.dataset.theme || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.textContent = theme === 'light' ? '◑ dark' : '◑ light';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Sync button label with whatever theme was set by the inline head script */
    var t = currentTheme();
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.textContent = t === 'light' ? '◑ dark' : '◑ light';
      btn.addEventListener('click', function () {
        applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
      });
    });
  });
})();
