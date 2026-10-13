(function () {
  function reportStorageError(action, key, error) {
    const message = `Could not ${action} "${key}" in this browser: ${error.message}`;
    if (typeof window.toast === 'function') window.toast(message, 'error');
    else console.error(message);
  }

  window.SMSStore = {
    load(key, fallback) {
      try {
        const stored = localStorage.getItem(key);
        return stored === null ? fallback : JSON.parse(stored);
      } catch (error) {
        reportStorageError('load data for', key, error);
        return fallback;
      }
    },
    save(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        reportStorageError('save data for', key, error);
        return false;
      }
    }
  };
})();
