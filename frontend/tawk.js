'use strict';

/**
 * Tawk.to Chat Widget
 * Внешний сервис для онлайн-чата
 */
(function initTawk() {
    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    
    window.Tawk_API = Tawk_API;
    window.Tawk_LoadStart = Tawk_LoadStart;

    var s1 = document.createElement('script');
    var s0 = document.getElementsByTagName('script')[0];
    
    s1.async = true;
    s1.src = 'https://embed.tawk.to/694c4d644be07019836864ee/1jd90sklr';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    s0.parentNode.insertBefore(s1, s0);
})();
