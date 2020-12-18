(function () {
    'use strict';

    onmessage = function onmessage(evt) {
      var _evt$data = evt.data,
          text = _evt$data.text,
          items = _evt$data.items;
      console.log(text);
    };

}());
//# sourceMappingURL=filter.js.map
