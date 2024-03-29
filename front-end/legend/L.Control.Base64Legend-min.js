(L.Control.Base64Legend = L.Control.extend({
  _map: null,
  includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
  options: {
    position: "topright",
    legends: [],
    collapseSimple: !1,
    detectStretched: !1
  },
  onAdd: function(e) {
    this._map = e;
    var t = L.DomUtil.create(
      "div",
      "leaflet-control leaflet-bar leaflet-legend"
    );
    return (
      (this._container = t),
      L.DomEvent.disableClickPropagation(t),
      L.Browser.touch || L.DomEvent.disableScrollPropagation(t),
      this.render(),
      this._container
    );
  },
  render: function() {
    L.DomUtil.empty(this._container);
    var e = this.options.legends;
    e &&
      e.forEach(function(e) {
        if (e.elements || e.elements) {
          var t = e.elements,
            l = "legend-block";
          this.options.detectStretched &&
            3 === t.length &&
            "" !== t[0].label &&
            "" === t[1].label &&
            "" !== t[2].label &&
            (e.type = "stretched"),
            "stretched" === e.type && (l += " legend-stretched");
          var n = L.DomUtil.create("div", l, this._container);
          if (this.options.collapseSimple && 1 == t.length && !t[0].label)
            return void this._addElement(t[0].imageData, e.name, n);
          if (e.name) {
            var i = L.DomUtil.create("h4", null, n);
            L.DomUtil.create("div", "caret", i),
              (L.DomUtil.create("span", null, i).innerHTML = e.name),
              L.DomEvent.on(
                i,
                "click",
                function() {
                  L.DomUtil.hasClass(i, "closed")
                    ? L.DomUtil.removeClass(i, "closed")
                    : L.DomUtil.addClass(i, "closed");
                },
                this
              );
          }
          var o = L.DomUtil.create("div", "legend-elements", n);
          t.forEach(function(e) {
            this._addElement(e.imageData, e.label, o);
          }, this);
        }
      }, this);
  },
  _addElement: function(e, t, l) {
    var n = L.DomUtil.create("div", "legend-row", l);
    (L.DomUtil.create("img", null, n).src = e),
      t && (L.DomUtil.create("label", null, n).innerHTML = t);
  }
})),
  (L.control.base64legend = function(e) {
    return new L.Control.Base64Legend(e);
  });
