L.HtmlOverlay = L.Layer.extend({
  options: {
    interactive: false,
    zIndex: 1,
    className: '',
    idName: '',
    zoom: ''
  },

  initialize: function (code, coords, options) {
    this._code = code;

    this._bounds = L.latLngBounds([coords, coords]);

    L.setOptions(this, options);


    this._scale = 1;
  },

  setLatLng: function (coords) {
    this.setBounds(L.latLngBounds([coords, coords]));
  },

  onAdd: function () {
    if (!this._dom) {
      this._initDom();
    }

    if (this.options.interactive) {
      L.DomUtil.addClass(this._dom, 'leaflet-interactive');
      this.addInteractiveTarget(this._dom);
    }

    this.getPane().appendChild(this._dom);
    this._reset();


    if (this.options.zoom === '') this.options.zoom = this._map.getZoom();


    this._scale = this._map.getZoomScale(this._map.getZoom(), this.options.zoom);


    this._inner.style.transform = "scale(" + this._scale + ")";

    this._map.on('zoomend', this._rescaleInnerHtml, this);
  },

  _rescaleInnerHtml() {
    this._scale *= this._rescale;
    this._inner.style.transform = "scale(" + this._scale + ")";
  },

  onRemove: function () {

    this._map.off('zoomend', this._rescaleInnerHtml, this);

    L.DomUtil.remove(this._dom);
    if (this.options.interactive) {
      this.removeInteractiveTarget(this._dom);
    }
  },

  _initDom: function () {

    var dom = L.DomUtil.create('div', 'leaflet-html-layer');


    if (this._zoomAnimated) { L.DomUtil.addClass(dom, 'leaflet-zoom-animated'); }
    if (this.options.className) { L.DomUtil.addClass(dom, this.options.className); }

    dom.onselectstart = function () { return false; };
    dom.onmousemove = function () { return false; };

    if (this.options.zIndex) {
      this._updateZIndex();
    }


    dom.innerHTML = this._code;

    this._dom = dom;
    this._dom.style.position = "relative";


    this._inner = this._dom.childNodes[0];
    this._inner.style.position = "absolute";
    this._inner.style.left = 0;
    this._inner.style.top = 0;
    this._inner.style['transform-origin'] = 'left top';
  },


  _animateZoom: function (e) {

    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

    L.DomUtil.setTransform(this._dom, offset, scale);

    this._rescale = scale;
  },

  bringToFront: function () {
    if (this._map) {
      L.DomUtil.toFront(this._dom);
    }
    return this;
  },
  bringToBack: function () {
    if (this._map) {
      L.DomUtil.toBack(this._dom);
    }
    return this;
  },
  getElement: function () {
    return this._dom;
  },

  _reset: function () {
    var dom = this._dom,
      bounds = new L.Bounds(
        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
      size = bounds.getSize();

    L.DomUtil.setPosition(dom, bounds.min);

    dom.style.width = size.x + 'px';
    dom.style.height = size.y + 'px';
  },
  _updateZIndex: function () {
    if (this._dom && this.options.zIndex !== undefined && this.options.zIndex !== null) {
      this._dom.style.zIndex = this.options.zIndex;
    }
  },
  _overlayOnError: function () {
    this.fire('error');
  },

  setBounds: function (bounds) {
    this._bounds = L.latLngBounds(bounds);

    if (this._map) {
      this._reset();
    }
    return this;
  },
  getEvents: function () {
    var events = {
      zoom: this._reset,
      viewreset: this._reset
    };

    if (this._zoomAnimated) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  },
  setZIndex: function (value) {
    this.options.zIndex = value;
    this._updateZIndex();
    return this;
  },
  getBounds: function () {
    return this._bounds;
  }

});

L.htmlOverlay = function (code, bounds, options) {
  return new L.HtmlOverlay(code, bounds, options);
}

if (typeof $ != 'undefined') {

  $.fn.htmlOverlay = function (coords, options) {
    if (typeof options == 'undefined') { options = {}; }

    var layers = [];

    $(this).each(function (i) {
      var code = $(this)[0].outerHTML;

      if ($(this).data('zoom')) {
        options.zoom = $(this).data('zoom');
      }
      if ($(this).data('pos')) {
        coords = $(this).data('pos').replace(' ', '').split(',');
      }
      $(this).remove();

      layers.push(L.htmlOverlay(code, coords, options));

    });

    if (layers.length > 1) {
      return L.layerGroup(layers);

    } else if (layers.length == 1) {
      return layers[0];

    } else {
      console.error("No html element to inject in map !");
      return {};
    }
  };

}