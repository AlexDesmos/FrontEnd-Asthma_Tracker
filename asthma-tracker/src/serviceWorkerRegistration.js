// ВНИМАНИЕ: Если у вас TypeScript-проект, переименуйте файл в serviceWorkerRegistration.ts
//           и проверьте, что импорты в index.tsx указывают именно на .ts

// Этот код позаимствован из стандартного шаблона CRA для PWA.
// По умолчанию Create React App не вызывает register() - это нужно делать явно.

// Это позволяет приложению работать офлайн и загружаться быстрее 
// при последующих посещениях в production. Однако при этом
// пользователи будут видеть обновления только после полного обновления вкладки. 
// Читайте больше об этом здесь: https://cra.link/PWA

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] - адрес IPv6 localhost.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 - IPv4 localhost.
    window.location.hostname.match(
      /^127(?:\.\d+){0,2}\.\d+$/
    )
  );
  
  export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // URL вашего service-worker-файла (сгенерированный CRA)
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        // Если PUBLIC_URL указывает на другое место, SW не будет работать корректно.
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // Если localhost, проверяем SW вручную
          checkValidServiceWorker(swUrl, config);
  
          navigator.serviceWorker.ready.then(() => {
            console.log('Это приложение работает в режиме кэша (PWA) на localhost.');
          });
        } else {
          // Регистрируем SW
          registerValidSW(swUrl, config);
        }
      });
    }
  }
  
  function registerValidSW(swUrl, config) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              // Если контент уже в кеше
              if (navigator.serviceWorker.controller) {
                // Выполнено обновление
                console.log('New content is available and will be used when all tabs for this page are closed.');
                // Вызываем коллбек, если передан
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                // Предварительно кэшировано
                console.log('Content is cached for offline use.');
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl, config) {
    // Проверяем, существует ли service-worker
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then((response) => {
        // Если не найден или вернул HTML, значит нет.
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('html') > -1)
        ) {
          // Отключаем SW (он может быть от предыдущего билда)
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // Иначе регистрируем
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log('No internet connection found. App is running in offline mode.');
      });
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }
  