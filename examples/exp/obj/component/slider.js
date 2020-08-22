var dengLignt = 50;
var slider = {
    use: function (id) {
        var self = this;
        self.slider = document.getElementById(id);
        self.bar = self.slider.querySelector(".progress-bar");
        self.thumb = self.slider.querySelector(".progress-thumb");
        self.slider.addEventListener("mousedown", function (e) {
            if (e.button == 0) {
                // 判断点击左键
                self.mDown = true;
                self.beginX = e.offsetX;
                self.positionX = e.offsetX;
                self.beginClientX = e.clientX;
                self.sliderLong = parseInt(self.getStyle(self.slider, "width"));
                var per = parseInt((self.positionX / self.sliderLong) * 100);
                self.bar.style.width = per + "%";
            }
        });
        document.addEventListener("mousemove", function (e) {
            if (self.mDown) {
                var moveX = e.clientX - self.beginClientX;
                self.positionX =
                    self.beginX + moveX > self.sliderLong
                        ? self.sliderLong
                        : self.beginX + moveX < 0
                            ? 0
                            : self.beginX + moveX;
                var per = parseInt((self.positionX / self.sliderLong) * 100);
                self.bar.style.width = per + "%";
            }
        });
        document.addEventListener("mouseup", function (e) {
            if (e.button == 0) {
                self.mDown = false;
            }
        });
    },
    getStyle: function (obj, styleName) {
        // 获取元素样式的方法
        if (obj.currentStyle) {
            return obj.currentStyle[styleName];
        } else {
            return getComputedStyle(obj, null)[styleName];
        }
    },
};
slider.use('lightingProgress');