/**
 * @module Ink.UI.ImageCell_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.ImageCell', '1',
    ['Ink.Util.Image_1'],
    function(Img) {


    var onImageDimsCb = function(err, o) {
        if (err) { console.log(err); }

        this.dimensions = o.dimensions;
        this._relayout();
    };



    /**
     * Abstracts an image container with the common layouts: cover/contain (see)
     * Can use CSS3 background-size or a measured image (measured automatically)
     *
     * @class Ink.Util.Image
     * @version 1
     * @static
     */
    var ImageCell = function(o) {
        this.cellDims = o.cellDims; // [w, h]
        this.mode     = o.mode;     // cover | contain
        this.uri      = o.uri;      // image URI
        this.skipCss3 = o.skipCss3; // use background-size or measure and layout by hand

        this.el = document.createElement('div');
        this.el.className = 'image-cell';

        var s;
        if (!this.skipCss3) {
            s = this.el.style;
            s.backgroundImage = 'url(' + this.uri + ')';
        }

        this.resize(this.cellDims);
    };

    ImageCell.prototype = {

        /**
         * use this whenever you need to change dimensions or update after a change in
         * any of the properties: this.skipCss3, this.mode
         *
         * @method resize
         * @param  {Array}  [cellDims]  new cell dimensions, if needs change
         */
        resize: function(cellDims) {
            if (cellDims) {
                this.cellDims = cellDims.slice();
            }

            var s = this.el.style;
            s.width  = cellDims[0] + 'px';
            s.height = cellDims[1] + 'px';

            if (this.skipCss3 && !this.imgEl) {
                this.imgEl = document.createElement('img');
                this.imgEl.src = this.uri;
                this.el.appendChild(this.imgEl);
                s.backgroundImage = '';
            }
            else if (!this.skipCss3 && this.imgEl) {
                this.el.removeChild(this.imgEl);
                delete this.imgEl;
                s.backgroundImage = 'url(' + this.uri + ')';
            }

            if (this.skipCss3 && !this.dimensions) {
                return Img.measureImage({
                    uri:  this.uri,
                    cb:   Ink.bind(onImageDimsCb, this)
                });
            }

            this._relayout();
        },

        _relayout: function() {
            var s;
            if (!this.skipCss3) {
                s = this.el.style;
                s.backgroundSize = this.mode;
            }
            else {
                s = this.imgEl.style;
                var dims = this.dimensions;

                var t = Img[ this.mode === 'cover' ? 'coverBox' : 'maximizeBox' ](this.cellDims, dims);
                var box = t[0];
                var pad = t[1];

                s.width      = box[0] + 'px';
                s.height     = box[1] + 'px';
                s.marginLeft = pad[0] + 'px';
                s.marginTop  = pad[1] + 'px';
            }
        }
    };



    return ImageCell;

});