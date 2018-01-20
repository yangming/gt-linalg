(function() {
  var Attract, AttractLine, AttractRepel, AttractRepelLine, Circle, Complex, Diagonalizable, Dynamics, HSVtoRGB, Hyperbolas, Repel, RepelLine, ScaleInOutShear, ScaleInShear, ScaleOutShear, Shear, Spiral, SpiralIn, SpiralOut, colorShader, colors, curTime, current, delay, diagShader, discLerp, duration, easeCode, element, expLerp, farthest, farthestX, farthestY, initialized, install, inv22, linLerp, linesDataElt, linesElt, makeAxes, makeControls, makeCoordMat, mathbox, mode, mult22, myMathBox, numPoints, numPointsCol, numPointsRow, ortho, points, polyLerp, randElt, randSign, reset, rotateShader, select, setupMathbox, shaderElt, shearShader, sizeShader, startup, stepMat, t, types, typesList, view, view0,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  easeCode = "#define M_PI 3.1415926535897932384626433832795\n\nfloat easeInOutSine(float pos) {\n    return 0.5 * (1.0 - cos(M_PI * pos));\n}";

  rotateShader = easeCode + "uniform float deltaAngle;\nuniform float scale;\nuniform float time;\n\nvec4 getPointSample(vec4 xyzw);\n\nvec4 rotate(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    if(time < start) {\n        return vec4(point.xy, 0.0, 0.0);\n    }\n    float pos = min((time - start) / duration, 1.0);\n    pos = easeInOutSine(pos);\n    float c = cos(deltaAngle * pos);\n    float s = sin(deltaAngle * pos);\n    point.xy = vec2(point.x * c - point.y * s, point.x * s + point.y * c)\n        * pow(scale, pos);\n    return vec4(point.xy, 0.0, 0.0);\n}";

  diagShader = easeCode + "uniform float scaleX;\nuniform float scaleY;\nuniform float time;\n\nvec4 getPointSample(vec4 xyzw);\n\nvec4 rotate(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    if(time < start) {\n        return vec4(point.xy, 0.0, 0.0);\n    }\n    float pos = min((time - start) / duration, 1.0);\n    pos = easeInOutSine(pos);\n    point.x *= pow(scaleX, pos);\n    point.y *= pow(scaleY, pos);\n    return vec4(point.xy, 0.0, 0.0);\n}";

  shearShader = easeCode + "uniform float scale;\nuniform float translate;\nuniform float time;\n\nvec4 getPointSample(vec4 xyzw);\n\nvec4 shear(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    if(time < start) {\n        return vec4(point.xy, 0.0, 0.0);\n    }\n    float pos = min((time - start) / duration, 1.0);\n    pos = easeInOutSine(pos);\n    float s = pow(scale, pos);\n    point.x  = s * (point.x + translate * pos * point.y);\n    point.y *= s;\n    return vec4(point.xy, 0.0, 0.0);\n}";

  colorShader = easeCode + "uniform float time;\n\nvec4 getPointSample(vec4 xyzw);\nvec4 getColorSample(vec4 xyzw);\n\nvec3 hsv2rgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n#define TRANSITION 0.2\n\nvec4 getColor(vec4 xyzw) {\n    vec4 color = getColorSample(xyzw);\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    float pos, ease;\n    pos = max(0.0, min(1.0, (time - start) / duration));\n    if(pos < TRANSITION) {\n        ease = easeInOutSine(pos / TRANSITION);\n        color.w *= ease * 0.6 + 0.4;\n        color.y *= ease * 0.6 + 0.4;\n    }\n    else if(pos > 1.0 - TRANSITION) {\n        ease = easeInOutSine((1.0 - pos) / TRANSITION);\n        color.w *= ease * 0.6 + 0.4;\n        color.y *= ease * 0.6 + 0.4;\n    }\n    return vec4(hsv2rgb(color.xyz), color.w);\n}";

  sizeShader = easeCode + "uniform float time;\nuniform float small;\n\nvec4 getPointSample(vec4 xyzw);\n\n#define TRANSITION 0.2\n#define BIG (small * 7.0 / 5.0)\n\nvec4 getSize(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    float pos, ease, size = BIG;\n    pos = max(0.0, min(1.0, (time - start) / duration));\n    if(pos < TRANSITION) {\n        ease = easeInOutSine(pos / TRANSITION);\n        size = small * (1.0-ease) + BIG * ease;\n    }\n    else if(pos > 1.0 - TRANSITION) {\n        ease = easeInOutSine((1.0 - pos) / TRANSITION);\n        size = small * (1.0-ease) + BIG * ease;\n    }\n    return vec4(size, 0.0, 0.0, 0.0);\n}";

  HSVtoRGB = function(h, s, v) {
    var f, i, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };

  expLerp = function(a, b) {
    return function(t) {
      return Math.pow(b, t) * Math.pow(a, 1 - t);
    };
  };

  linLerp = function(a, b) {
    return function(t) {
      return b * t + a * (1 - t);
    };
  };

  polyLerp = function(a, b, n) {
    return function(t) {
      return Math.pow(t, n) * (b - a) + a;
    };
  };

  discLerp = function(a, b, n) {
    return function(t) {
      return Math.floor(Math.random() * (n + 1)) * (b - a) / n + a;
    };
  };

  randElt = function(l) {
    return l[Math.floor(Math.random() * l.length)];
  };

  randSign = function() {
    return randElt([-1, 1]);
  };

  mult22 = function(m, v) {
    return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  };

  inv22 = function(m) {
    var det;
    det = m[0] * m[3] - m[1] * m[2];
    return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det];
  };

  ortho = 1e5;

  myMathBox = function(options) {
    var ref, three;
    three = THREE.Bootstrap(options);
    if (!three.fallback) {
      if (!three.Time) {
        three.install('time');
      }
      if (!three.MathBox) {
        three.install(['mathbox']);
      }
    }
    return (ref = three.mathbox) != null ? ref : three;
  };

  mathbox = null;

  view0 = null;

  setupMathbox = function() {
    var three;
    mathbox = window.mathbox = myMathBox({
      plugins: ['core'],
      mathbox: {
        inspect: false,
        splash: false
      },
      camera: {
        near: ortho / 4,
        far: ortho * 4
      },
      element: document.getElementById("mathbox")
    });
    if (mathbox.fallback) {
      throw "WebGL not supported";
    }
    three = window.three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);
    mathbox.camera({
      proxy: false,
      position: [0, 0, ortho],
      lookAt: [0, 0, 0],
      up: [1, 0, 0],
      fov: Math.atan(1 / ortho) * 360 / π
    });
    mathbox.set('focus', ortho / 1.5);
    return view0 = mathbox.cartesian({
      range: [[-1, 1], [-1, 1]],
      scale: [1, 1]
    });
  };

  current = null;

  numPointsRow = 50;

  numPointsCol = 100;

  numPoints = numPointsRow * numPointsCol - 1;

  duration = 3.0;

  delay = function(first) {
    var pos, scale;
    scale = numPoints / 1000;
    pos = Math.random() * scale;
    if (first) {
      return pos - 0.5 * scale;
    } else {
      return pos;
    }
  };

  curTime = 0;

  mode = 'spiralIn';

  points = [[0, 0, -1, 1e15]];

  stepMat = [];

  colors = [[0, 0, 0, 1]].concat((function() {
    var k, ref, results;
    results = [];
    for (k = 0, ref = numPoints; 0 <= ref ? k < ref : k > ref; 0 <= ref ? k++ : k--) {
      results.push([Math.random(), 1, 0.7, 1]);
    }
    return results;
  })());

  view = null;

  farthest = 0;

  farthestX = 0;

  farthestY = 0;

  makeCoordMat = function() {
    var coordMat, coordMatInv, corners, distribution, len, transformMat, v1, v2, θ, θoff;
    v1 = [0, 0];
    v2 = [0, 0];
    distribution = linLerp(0.5, 2);
    len = distribution(Math.random());
    θ = Math.random() * 2 * π;
    v1[0] = Math.cos(θ) * len;
    v1[1] = Math.sin(θ) * len;
    θoff = randSign() * linLerp(π / 4, 3 * π / 4)(Math.random());
    len = distribution(Math.random());
    v2[0] = Math.cos(θ + θoff) * len;
    v2[1] = Math.sin(θ + θoff) * len;
    coordMat = [v1[0], v2[0], v1[1], v2[1]];
    coordMatInv = inv22(coordMat);
    corners = [[1, 1], [-1, 1]].map(function(c) {
      return mult22(coordMatInv, c);
    });
    farthest = Math.max.apply(null, corners.map(function(c) {
      return c[0] * c[0] + c[1] * c[1];
    }));
    farthest = Math.sqrt(farthest);
    farthestX = Math.max.apply(null, corners.map(function(c) {
      return Math.abs(c[0]);
    }));
    farthestY = Math.max.apply(null, corners.map(function(c) {
      return Math.abs(c[1]);
    }));
    transformMat = [coordMat[0], coordMat[1], 0, 0, coordMat[2], coordMat[3], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    if (view) {
      return view.set('matrix', transformMat);
    } else {
      return view = view0.transform({
        matrix: transformMat
      });
    }
  };

  makeAxes = function() {
    var i, k, len1, ref, results;
    ref = [1, 2];
    results = [];
    for (k = 0, len1 = ref.length; k < len1; k++) {
      i = ref[k];
      results.push(view.axis({
        axis: i,
        end: false,
        width: 3,
        size: 5,
        zBias: -1,
        depth: 1,
        color: "black",
        opacity: 0.3,
        range: [-10, 10]
      }));
    }
    return results;
  };

  initialized = false;

  shaderElt = null;

  linesElt = null;

  linesDataElt = null;

  Dynamics = (function() {
    function Dynamics() {
      this.refClosed = bind(this.refClosed, this);
      this.linesParams = bind(this.linesParams, this);
      this.install = bind(this.install, this);
    }

    Dynamics.prototype.install = function() {
      var canvas, i, k, pointsElt, ref;
      canvas = mathbox._context.canvas;
      for (i = k = 1, ref = numPoints; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
        this.newPoint(i, true);
        points[i][2] = curTime + delay(true);
      }
      if (initialized) {
        shaderElt.set(this.shaderParams());
        linesDataElt.set(this.linesParams());
        return linesElt.set("closed", this.refClosed());
      } else {
        pointsElt = view.matrix({
          id: "points-orig",
          channels: 4,
          width: numPointsRow,
          height: numPointsCol,
          data: points
        });
        shaderElt = pointsElt.shader(this.shaderParams(), {
          time: function(t) {
            return curTime = t;
          }
        });
        shaderElt.resample({
          id: "points"
        });
        view0.matrix({
          channels: 4,
          width: numPointsRow,
          height: numPointsCol,
          data: colors,
          live: false
        }).shader({
          code: colorShader,
          sources: [pointsElt]
        }, {
          time: function(t) {
            return t;
          }
        }).resample({
          id: "colors"
        });
        view0.shader({
          code: sizeShader
        }, {
          time: function(t) {
            return t;
          },
          small: function() {
            return 5 / 739 * canvas.clientWidth;
          }
        }).resample({
          source: pointsElt,
          id: "sizes"
        });
        view.point({
          points: "#points",
          color: "white",
          colors: "#colors",
          size: 1,
          sizes: "#sizes",
          zBias: 1,
          zIndex: 2
        });
        linesDataElt = view.matrix(this.linesParams());
        linesElt = view.line({
          color: "rgb(80, 120, 255)",
          width: 2,
          opacity: 0.4,
          zBias: 0,
          zIndex: 1,
          closed: this.refClosed()
        });
        return initialized = true;
      }
    };

    Dynamics.prototype.linesParams = function() {
      this.reference = this.makeReference();
      return {
        channels: 2,
        height: this.reference.length,
        width: this.reference[0].length,
        items: this.reference[0][0].length,
        data: this.reference,
        live: false
      };
    };

    Dynamics.prototype.refClosed = function() {
      return false;
    };

    return Dynamics;

  })();

  Complex = (function(superClass) {
    extend(Complex, superClass);

    function Complex() {
      this.shaderParams = bind(this.shaderParams, this);
      this.newPoint = bind(this.newPoint, this);
      Complex.__super__.constructor.apply(this, arguments);
      this.deltaAngle = randSign() * linLerp(π / 6, 5 * π / 6)(Math.random());
      this.scale = this.getScale();
      stepMat = [Math.cos(this.deltaAngle) * this.scale, -Math.sin(this.deltaAngle) * this.scale, Math.sin(this.deltaAngle) * this.scale, Math.cos(this.deltaAngle) * this.scale];
      this.makeDistributions();
    }

    Complex.prototype.newPoint = function(i, first) {
      var distribution, r, θ;
      distribution = first ? this.origDist : this.newDist;
      r = distribution(Math.random());
      θ = Math.random() * 2 * π;
      return points[i] = [Math.cos(θ) * r, Math.sin(θ) * r, 0, duration];
    };

    Complex.prototype.shaderParams = function() {
      return {
        code: rotateShader,
        uniforms: {
          deltaAngle: {
            type: 'f',
            value: this.deltaAngle
          },
          scale: {
            type: 'f',
            value: this.scale
          }
        }
      };
    };

    return Complex;

  })(Dynamics);

  Circle = (function(superClass) {
    extend(Circle, superClass);

    function Circle() {
      this.refClosed = bind(this.refClosed, this);
      this.updatePoint = bind(this.updatePoint, this);
      this.makeReference = bind(this.makeReference, this);
      this.makeDistributions = bind(this.makeDistributions, this);
      this.getScale = bind(this.getScale, this);
      return Circle.__super__.constructor.apply(this, arguments);
    }

    Circle.prototype.getScale = function() {
      return 1;
    };

    Circle.prototype.makeDistributions = function() {
      return this.newDist = this.origDist = polyLerp(0.01, farthest, 1 / 2);
    };

    Circle.prototype.makeReference = function() {
      var k, o, ref, ref1, ref2, ref3, ref4, ret, row, s, t;
      ret = [];
      for (t = k = 0, ref = 2 * π, ref1 = π / 72; ref1 > 0 ? k < ref : k > ref; t = k += ref1) {
        row = [];
        for (s = o = ref2 = farthest / 10, ref3 = farthest, ref4 = farthest / 10; ref4 > 0 ? o < ref3 : o > ref3; s = o += ref4) {
          row.push([s * Math.cos(t), s * Math.sin(t)]);
        }
        ret.push(row);
      }
      return [ret];
    };

    Circle.prototype.updatePoint = function(i) {
      return points[i];
    };

    Circle.prototype.refClosed = function() {
      return true;
    };

    return Circle;

  })(Complex);

  Spiral = (function(superClass) {
    extend(Spiral, superClass);

    function Spiral() {
      this.makeReference = bind(this.makeReference, this);
      return Spiral.__super__.constructor.apply(this, arguments);
    }

    Spiral.prototype.makeReference = function() {
      var close, i, items, iters, j, k, o, ref, ref1, ref2, ret, rotations, row, s, ss, t, u, w;
      ret = [];
      close = 0.05;
      s = this.scale > 1 ? this.scale : 1 / this.scale;
      iters = (Math.log(farthest) - Math.log(close)) / Math.log(s);
      rotations = Math.ceil(this.deltaAngle * iters / 2 * π);
      for (i = k = 0, ref = rotations; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        row = [];
        for (t = o = 0; o <= 100; t = ++o) {
          u = (i + t / 100) * 2 * π;
          ss = close * Math.pow(s, u / this.deltaAngle);
          items = [];
          for (j = w = 0, ref1 = 2 * π, ref2 = π / 4; ref2 > 0 ? w < ref1 : w > ref1; j = w += ref2) {
            items.push([ss * Math.cos(u + j), ss * Math.sin(u + j)]);
          }
          row.push(items);
        }
        ret.push(row);
      }
      return ret;
    };

    return Spiral;

  })(Complex);

  SpiralIn = (function(superClass) {
    extend(SpiralIn, superClass);

    function SpiralIn() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeDistributions = bind(this.makeDistributions, this);
      return SpiralIn.__super__.constructor.apply(this, arguments);
    }

    SpiralIn.prototype.getScale = function() {
      return linLerp(0.3, 0.8)(Math.random());
    };

    SpiralIn.prototype.makeDistributions = function() {
      var distance, distances;
      this.close = 0.01;
      this.medium = farthest;
      this.far = farthest / this.scale;
      switch (randElt(['cont', 'disc'])) {
        case 'cont':
          this.origDist = expLerp(this.close, this.far);
          return this.newDist = expLerp(this.medium, this.far);
        case 'disc':
          distances = [];
          distance = this.far;
          while (distance > this.close) {
            distances.push(distance);
            distance *= this.scale;
          }
          this.origDist = function(t) {
            return distances[Math.floor(t * distances.length)];
          };
          return this.newDist = (function(_this) {
            return function(t) {
              return _this.far;
            };
          })(this);
      }
    };

    SpiralIn.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (point[0] * point[0] + point[1] * point[1] < this.close * this.close) {
        this.newPoint(i);
      }
      return points[i];
    };

    return SpiralIn;

  })(Spiral);

  SpiralOut = (function(superClass) {
    extend(SpiralOut, superClass);

    function SpiralOut() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeDistributions = bind(this.makeDistributions, this);
      this.getScale = bind(this.getScale, this);
      return SpiralOut.__super__.constructor.apply(this, arguments);
    }

    SpiralOut.prototype.getScale = function() {
      return linLerp(1 / 0.8, 1 / 0.3)(Math.random());
    };

    SpiralOut.prototype.makeDistributions = function() {
      var distance, distances;
      this.veryClose = 0.01 / this.scale;
      this.close = 0.01;
      this.medium = farthest;
      switch (randElt(['cont', 'disc'])) {
        case 'cont':
          this.origDist = expLerp(this.veryClose, this.medium);
          return this.newDist = expLerp(this.veryClose, this.close);
        case 'disc':
          distances = [];
          distance = this.veryClose;
          while (distance < this.medium) {
            distances.push(distance);
            distance *= this.scale;
          }
          this.origDist = function(t) {
            return distances[Math.floor(t * distances.length)];
          };
          return this.newDist = (function(_this) {
            return function(t) {
              return _this.veryClose;
            };
          })(this);
      }
    };

    SpiralOut.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (point[0] * point[0] + point[1] * point[1] > this.medium * this.medium) {
        this.newPoint(i);
      }
      return points[i];
    };

    return SpiralOut;

  })(Spiral);

  Diagonalizable = (function(superClass) {
    extend(Diagonalizable, superClass);

    function Diagonalizable() {
      this.shaderParams = bind(this.shaderParams, this);
      Diagonalizable.__super__.constructor.apply(this, arguments);
      this.makeScales();
      stepMat = [this.scaleX, 0, 0, this.scaleY];
    }

    Diagonalizable.prototype.shaderParams = function() {
      return {
        code: diagShader,
        uniforms: {
          scaleX: {
            type: 'f',
            value: this.scaleX
          },
          scaleY: {
            type: 'f',
            value: this.scaleY
          }
        }
      };
    };

    return Diagonalizable;

  })(Dynamics);

  Hyperbolas = (function(superClass) {
    extend(Hyperbolas, superClass);

    function Hyperbolas() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeReference = bind(this.makeReference, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return Hyperbolas.__super__.constructor.apply(this, arguments);
    }

    Hyperbolas.prototype.makeScales = function() {
      this.scaleX = linLerp(0.3, 0.8)(Math.random());
      this.scaleY = linLerp(1 / 0.8, 1 / 0.3)(Math.random());
      this.logScaleX = Math.log(this.scaleX);
      this.logScaleY = Math.log(this.scaleY);
      this.close = 0.05;
      this.closeR = Math.pow(this.close, this.logScaleY - this.logScaleX);
      this.farR = Math.pow(farthestX, this.logScaleY) * Math.pow(farthestY, -this.logScaleX);
      return this.lerpR = linLerp(this.closeR, this.farR);
    };

    Hyperbolas.prototype.newPoint = function(i, first) {
      var closeX, r, x, y;
      r = this.lerpR(Math.random());
      if (first) {
        closeX = Math.pow(r * Math.pow(farthestY, this.logScaleX), 1 / this.logScaleY);
        x = expLerp(closeX, farthestX / this.scaleX)(Math.random());
      } else {
        x = expLerp(farthestX, farthestX / this.scaleX)(Math.random());
      }
      y = Math.pow(1 / r * Math.pow(x, this.logScaleY), 1 / this.logScaleX);
      return points[i] = [randSign() * x, randSign() * y, 0, duration];
    };

    Hyperbolas.prototype.makeReference = function() {
      var closeX, i, k, lerp, o, r, ret, row, t, x, y;
      ret = [];
      for (t = k = 0; k < 20; t = ++k) {
        r = this.lerpR(t / 20);
        closeX = Math.pow(r * Math.pow(farthestY, this.logScaleX), 1 / this.logScaleY);
        lerp = expLerp(closeX, farthestX);
        row = [];
        for (i = o = 0; o <= 100; i = ++o) {
          x = lerp(i / 100);
          y = Math.pow(1 / r * Math.pow(x, this.logScaleY), 1 / this.logScaleX);
          row.push([[x, y], [-x, y], [x, -y], [-x, -y]]);
        }
        ret.push(row);
      }
      return ret;
    };

    Hyperbolas.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[1]) > farthestY) {
        this.newPoint(i);
      }
      return points[i];
    };

    return Hyperbolas;

  })(Diagonalizable);

  AttractRepel = (function(superClass) {
    extend(AttractRepel, superClass);

    function AttractRepel() {
      this.makeReference = bind(this.makeReference, this);
      this.makeScales = bind(this.makeScales, this);
      return AttractRepel.__super__.constructor.apply(this, arguments);
    }

    AttractRepel.prototype.makeScales = function() {
      var a, offset;
      this.logScaleX = Math.log(this.scaleX);
      this.logScaleY = Math.log(this.scaleY);
      offset = 0.05;
      this.lerpR = function(t) {
        t = linLerp(offset, 1 - offset)(t);
        return Math.pow(t, this.logScaleY) * Math.pow(1 - t, -this.logScaleX);
      };
      a = this.logScaleY / this.logScaleX;
      this.sMin = 0.01;
      this.sMax = Math.pow(farthestX, a) + farthestY;
      this.yValAt = function(r, s) {
        return s / (1 + Math.pow(r, 1 / this.logScaleX));
      };
      return this.xOfY = function(y, r) {
        return Math.pow(r * Math.pow(y, this.logScaleX), 1 / this.logScaleY);
      };
    };

    AttractRepel.prototype.makeReference = function() {
      var i, k, lerp, o, r, ret, row, x, y;
      ret = [];
      for (i = k = 0; k < 15; i = ++k) {
        r = this.lerpR(i / 15);
        lerp = expLerp(0.01, farthestY);
        row = [];
        for (i = o = 0; o <= 100; i = ++o) {
          y = lerp(i / 100);
          x = this.xOfY(y, r);
          row.push([[x, y], [-x, y], [x, -y], [-x, -y]]);
        }
        ret.push(row);
      }
      return ret;
    };

    return AttractRepel;

  })(Diagonalizable);

  Attract = (function(superClass) {
    extend(Attract, superClass);

    function Attract() {
      this.updatePoint = bind(this.updatePoint, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return Attract.__super__.constructor.apply(this, arguments);
    }

    Attract.prototype.makeScales = function() {
      this.scaleX = linLerp(0.3, 0.9)(Math.random());
      this.scaleY = linLerp(0.3, this.scaleX)(Math.random());
      return Attract.__super__.makeScales.apply(this, arguments);
    };

    Attract.prototype.newPoint = function(i, first) {
      var closeY, farY, r, x, y;
      r = this.lerpR(Math.random());
      farY = this.yValAt(r, this.sMax / this.scaleY);
      if (first) {
        closeY = this.yValAt(r, this.sMin);
      } else {
        closeY = this.yValAt(r, this.sMax);
      }
      y = expLerp(closeY, farY)(Math.random());
      x = this.xOfY(y, r);
      return points[i] = [randSign() * x, randSign() * y, 0, duration];
    };

    Attract.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[1]) < .01) {
        this.newPoint(i);
      }
      return points[i];
    };

    return Attract;

  })(AttractRepel);

  Repel = (function(superClass) {
    extend(Repel, superClass);

    function Repel() {
      this.updatePoint = bind(this.updatePoint, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return Repel.__super__.constructor.apply(this, arguments);
    }

    Repel.prototype.makeScales = function() {
      this.scaleY = linLerp(1 / 0.9, 1 / 0.3)(Math.random());
      this.scaleX = linLerp(1 / 0.9, this.scaleY)(Math.random());
      return Repel.__super__.makeScales.apply(this, arguments);
    };

    Repel.prototype.newPoint = function(i, first) {
      var closeY, farY, r, x, y;
      r = this.lerpR(Math.random());
      closeY = this.yValAt(r, this.sMin / this.scaleY);
      if (first) {
        farY = this.yValAt(r, this.sMax);
      } else {
        farY = this.yValAt(r, this.sMin);
      }
      y = expLerp(closeY, farY)(Math.random());
      x = this.xOfY(y, r);
      return points[i] = [randSign() * x, randSign() * y, 0, duration];
    };

    Repel.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[0]) > farthestX || Math.abs(point[1]) > farthestY) {
        this.newPoint(i);
      }
      return points[i];
    };

    return Repel;

  })(AttractRepel);

  AttractRepelLine = (function(superClass) {
    extend(AttractRepelLine, superClass);

    function AttractRepelLine() {
      this.makeReference = bind(this.makeReference, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return AttractRepelLine.__super__.constructor.apply(this, arguments);
    }

    AttractRepelLine.prototype.makeScales = function() {
      this.scaleX = 1;
      return this.lerpX = linLerp(-farthestX, farthestX);
    };

    AttractRepelLine.prototype.newPoint = function(i, first) {
      var x, y;
      x = this.lerpX(Math.random());
      y = (first ? this.origLerpY : this.newLerpY)(Math.random());
      return points[i] = [x, randSign() * y, 0, duration];
    };

    AttractRepelLine.prototype.makeReference = function() {
      var i, item1, item2, k, x;
      item1 = [];
      item2 = [];
      for (i = k = 0; k < 20; i = ++k) {
        x = this.lerpX((i + .5) / 20);
        item1.push([x, -farthestY]);
        item2.push([x, farthestY]);
      }
      return [[item1, item2]];
    };

    return AttractRepelLine;

  })(Diagonalizable);

  AttractLine = (function(superClass) {
    extend(AttractLine, superClass);

    function AttractLine() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeScales = bind(this.makeScales, this);
      return AttractLine.__super__.constructor.apply(this, arguments);
    }

    AttractLine.prototype.makeScales = function() {
      AttractLine.__super__.makeScales.apply(this, arguments);
      this.scaleY = linLerp(0.3, 0.8)(Math.random());
      this.origLerpY = expLerp(0.01, farthestY / this.scaleY);
      return this.newLerpY = expLerp(farthestY, farthestY / this.scaleY);
    };

    AttractLine.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[1]) < 0.01) {
        this.newPoint(i);
      }
      return points[i];
    };

    return AttractLine;

  })(AttractRepelLine);

  RepelLine = (function(superClass) {
    extend(RepelLine, superClass);

    function RepelLine() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeScales = bind(this.makeScales, this);
      return RepelLine.__super__.constructor.apply(this, arguments);
    }

    RepelLine.prototype.makeScales = function() {
      RepelLine.__super__.makeScales.apply(this, arguments);
      this.scaleY = linLerp(1 / 0.8, 1 / 0.3)(Math.random());
      this.origLerpY = expLerp(0.01 / this.scaleY, farthestY);
      return this.newLerpY = expLerp(0.01 / this.scaleY, 0.01);
    };

    RepelLine.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[1]) > farthestY) {
        this.newPoint(i);
      }
      return points[i];
    };

    return RepelLine;

  })(AttractRepelLine);

  Shear = (function(superClass) {
    extend(Shear, superClass);

    function Shear() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeReference = bind(this.makeReference, this);
      this.shaderParams = bind(this.shaderParams, this);
      this.newPoint = bind(this.newPoint, this);
      this.translate = randSign() * linLerp(0.2, 2.0)(Math.random());
      stepMat = [1, this.translate, 0, 1];
      this.lerpY = linLerp(0.01, farthestY);
      this.lerpY2 = linLerp(-farthestY, farthestY);
    }

    Shear.prototype.newPoint = function(i, first) {
      var a, s, x, y;
      a = this.translate;
      if (first) {
        y = this.lerpY(Math.random());
        if (Math.random() < 0.005) {
          y = 0;
          x = linLerp(-farthestX, farthestX)(Math.random());
        } else {
          if (a < 0) {
            x = linLerp(-farthestX, farthestX - a * y)(Math.random());
          } else {
            x = linLerp(-farthestX - a * y, farthestX)(Math.random());
          }
        }
      } else {
        y = points[i][1];
        if (a < 0) {
          x = linLerp(farthestX, farthestX - a * y)(Math.random());
        } else {
          x = linLerp(-farthestX - a * y, -farthestX)(Math.random());
        }
      }
      s = randSign();
      return points[i] = [s * x, s * y, 0, duration];
    };

    Shear.prototype.shaderParams = function() {
      return {
        code: shearShader,
        uniforms: {
          scale: {
            type: 'f',
            value: 1.0
          },
          translate: {
            type: 'f',
            value: this.translate
          }
        }
      };
    };

    Shear.prototype.makeReference = function() {
      var i, item1, item2, k, y;
      item1 = [];
      item2 = [];
      for (i = k = 0; k < 20; i = ++k) {
        y = this.lerpY2((i + .5) / 20);
        item1.push([-farthestX, y]);
        item2.push([farthestX, y]);
      }
      return [[item1, item2]];
    };

    Shear.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[0]) > farthestX) {
        this.newPoint(i);
      }
      return points[i];
    };

    return Shear;

  })(Dynamics);

  ScaleInOutShear = (function(superClass) {
    extend(ScaleInOutShear, superClass);

    function ScaleInOutShear() {
      this.makeReference = bind(this.makeReference, this);
      this.shaderParams = bind(this.shaderParams, this);
      this.newPoint = bind(this.newPoint, this);
      var a, λ;
      this.translate = randSign() * linLerp(0.2, 2.0)(Math.random());
      λ = this.scale;
      a = this.translate;
      stepMat = [λ, λ * a, 0, λ];
      this.xOfY = function(r, y) {
        return y * (r + a * Math.log(y) / Math.log(λ));
      };
      this.lerpR = function(t) {
        return Math.tan((t - 0.5) * π);
      };
      this.lerpR2 = function(t) {
        return Math.tan((t / 0.99 + 0.005 - 0.5) * π);
      };
    }

    ScaleInOutShear.prototype.newPoint = function(i, first) {
      var r, s, x, y;
      r = this.lerpR2(Math.random());
      y = (first ? this.lerpY : this.lerpYNew)(Math.random());
      x = this.xOfY(r, y);
      s = randSign();
      return points[i] = [s * x, s * y, 0, duration];
    };

    ScaleInOutShear.prototype.shaderParams = function() {
      return {
        code: shearShader,
        uniforms: {
          scale: {
            type: 'f',
            value: this.scale
          },
          translate: {
            type: 'f',
            value: this.translate
          }
        }
      };
    };

    ScaleInOutShear.prototype.makeReference = function() {
      var i, j, k, numLines, o, r, ref, ret, row, x, y;
      ret = [];
      numLines = 40;
      for (i = k = 1, ref = numLines; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
        r = this.lerpR(i / numLines);
        row = [];
        for (j = o = 0; o < 100; j = ++o) {
          y = this.lerpY(j / 100);
          x = this.xOfY(r, y);
          row.push([[x, y], [-x, -y]]);
        }
        ret.push(row);
      }
      return ret;
    };

    return ScaleInOutShear;

  })(Dynamics);

  ScaleOutShear = (function(superClass) {
    extend(ScaleOutShear, superClass);

    function ScaleOutShear() {
      this.updatePoint = bind(this.updatePoint, this);
      this.scale = linLerp(1 / 0.7, 1 / 0.3)(Math.random());
      this.lerpY = expLerp(0.01 / this.scale, farthestY);
      this.lerpYNew = expLerp(0.01 / this.scale, 0.01);
      ScaleOutShear.__super__.constructor.apply(this, arguments);
    }

    ScaleOutShear.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[1]) > farthestY) {
        this.newPoint(i);
      }
      return points[i];
    };

    return ScaleOutShear;

  })(ScaleInOutShear);

  ScaleInShear = (function(superClass) {
    extend(ScaleInShear, superClass);

    function ScaleInShear() {
      this.updatePoint = bind(this.updatePoint, this);
      this.scale = linLerp(0.3, 0.7)(Math.random());
      this.lerpY = expLerp(0.01, farthestY / this.scale);
      this.lerpYNew = expLerp(farthestY, farthestY / this.scale);
      ScaleInShear.__super__.constructor.apply(this, arguments);
    }

    ScaleInShear.prototype.updatePoint = function(i) {
      var point;
      point = points[i];
      if (Math.abs(point[1]) < .01) {
        this.newPoint(i);
      }
      return points[i];
    };

    return ScaleInShear;

  })(ScaleInOutShear);

  types = [["all", null], ["ellipse", Circle], ["spiral in", SpiralIn], ["spiral out", SpiralOut], ["hyperbolas", Hyperbolas], ["attract point", Attract], ["repel point", Repel], ["attract line", AttractLine], ["repel line", RepelLine], ["shear", Shear], ["scale out shear", ScaleOutShear], ["scale in shear", ScaleInShear]];

  typesList = (function() {
    var k, len1, ref, results;
    ref = types.slice(1);
    results = [];
    for (k = 0, len1 = ref.length; k < len1; k++) {
      t = ref[k];
      results.push(t[1]);
    }
    return results;
  })();

  select = null;

  reset = function() {
    var type;
    makeCoordMat();
    if (select) {
      type = types.filter(function(x) {
        return x[0] === select.value;
      })[0][1];
    }
    if (!type) {
      type = randElt(typesList);
    }
    current = window.current = new type();
    return current.install();
  };

  window.doCover = startup = function() {
    setupMathbox();
    makeCoordMat();
    makeAxes();
    reset();
    return setInterval(function() {
      var end, i, k, len1, point, ref;
      for (i = k = 0, len1 = points.length; k < len1; i = ++k) {
        point = points[i];
        if (i === 0) {
          continue;
        }
        end = point[2] + point[3];
        if (end < curTime) {
          ref = mult22(stepMat, point), point[0] = ref[0], point[1] = ref[1];
          point = current.updatePoint(i);
          point[2] = curTime + delay();
        }
      }
      return null;
    }, 100);
  };

  makeControls = function(elt) {
    var button, div, k, key, len1, option, ref, val;
    div = document.createElement("div");
    div.id = "cover-controls";
    button = document.createElement("button");
    button.innerText = "Go";
    button.onclick = reset;
    select = document.createElement("select");
    for (k = 0, len1 = types.length; k < len1; k++) {
      ref = types[k], key = ref[0], val = ref[1];
      option = document.createElement("option");
      option.innerText = key;
      select.appendChild(option);
    }
    div.appendChild(select);
    div.appendChild(button);
    return elt.appendChild(div);
  };

  install = function(elt) {
    var content, div, div2, main;
    div = document.createElement("div");
    div.id = "mathbox-container";
    div2 = document.createElement("div");
    div2.id = "mathbox";
    div.appendChild(div2);
    elt.appendChild(div);
    main = document.getElementsByClassName("main")[0];
    if (main) {
      elt.style.width = main.clientWidth + "px";
      content = document.getElementById("content");
      elt.style.marginLeft = "-" + getComputedStyle(content, null).marginLeft;
    }
    makeControls(elt);
    return startup();
  };

  element = document.getElementById("cover");

  if (element) {
    install(element);
  }

}).call(this);