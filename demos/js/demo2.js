(function() {
  "use strict";
  var Caption, ClipCube, Demo, Demo2D, Draggable, Grid, LabeledVectors, LinearCombo, Popup, Subspace, View, clipFragment, clipShader, decodeQS, extend, makeTvec, orthogonalize, rowReduce, setTvec, urlParams,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  extend = function(obj, src) {
    var key, results, val;
    results = [];
    for (key in src) {
      val = src[key];
      if (src.hasOwnProperty(key)) {
        results.push(obj[key] = val);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  orthogonalize = (function() {
    var tmpVec;
    tmpVec = null;
    return function(vec1, vec2) {
      if (tmpVec == null) {
        tmpVec = new THREE.Vector3();
      }
      tmpVec.copy(vec1.normalize());
      return vec2.sub(tmpVec.multiplyScalar(vec2.dot(vec1))).normalize();
    };
  })();

  makeTvec = function(vec) {
    var ref, ret;
    if (vec instanceof THREE.Vector3) {
      return vec;
    }
    ret = new THREE.Vector3();
    return ret.set(vec[0], vec[1], (ref = vec[2]) != null ? ref : 0);
  };

  setTvec = function(orig, vec) {
    var ref;
    if (vec instanceof THREE.Vector3) {
      return orig.copy(vec);
    } else {
      return orig.set(vec[0], vec[1], (ref = vec[2]) != null ? ref : 0);
    }
  };

  rowReduce = function(M, opts) {
    var E, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, c, col, colBasis, f, fn, i, j, k, l, lastPivot, len, len1, m, maxEl, maxRow, n, noPivots, nulBasis, orig, pivot, pivots, q, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref3, ref4, ref5, ref6, ref7, ref8, ref9, row, u, v;
    orig = (function() {
      var l, len, results;
      results = [];
      for (l = 0, len = M.length; l < len; l++) {
        c = M[l];
        results.push(c.slice());
      }
      return results;
    })();
    if (opts == null) {
      opts = {};
    }
    m = (ref = opts.rows) != null ? ref : M[0].length;
    n = (ref1 = opts.cols) != null ? ref1 : M.length;
    row = 0;
    col = 0;
    pivots = [];
    lastPivot = -1;
    noPivots = [];
    colBasis = [];
    nulBasis = [];
    E = (function() {
      var l, ref2, results;
      results = [];
      for (l = 0, ref2 = m; 0 <= ref2 ? l < ref2 : l > ref2; 0 <= ref2 ? l++ : l--) {
        results.push((function() {
          var q, ref3, results1;
          results1 = [];
          for (q = 0, ref3 = m; 0 <= ref3 ? q < ref3 : q > ref3; 0 <= ref3 ? q++ : q--) {
            results1.push(0);
          }
          return results1;
        })());
      }
      return results;
    })();
    for (i = l = 0, ref2 = m; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
      E[i][i] = 1;
    }
    while (true) {
      if (col === n) {
        break;
      }
      if (row === m) {
        for (k = q = ref3 = col, ref4 = n; ref3 <= ref4 ? q < ref4 : q > ref4; k = ref3 <= ref4 ? ++q : --q) {
          noPivots.push(k);
        }
        break;
      }
      maxEl = Math.abs(M[col][row]);
      maxRow = row;
      for (k = u = ref5 = row + 1, ref6 = m; ref5 <= ref6 ? u < ref6 : u > ref6; k = ref5 <= ref6 ? ++u : --u) {
        if (Math.abs(M[col][k]) > maxEl) {
          maxEl = Math.abs(M[col][k]);
          maxRow = k;
        }
      }
      if (maxEl === 0) {
        noPivots.push(col);
        col++;
        continue;
      }
      for (k = v = 0, ref7 = n; 0 <= ref7 ? v < ref7 : v > ref7; k = 0 <= ref7 ? ++v : --v) {
        ref8 = [M[k][row], M[k][maxRow]], M[k][maxRow] = ref8[0], M[k][row] = ref8[1];
      }
      for (k = aa = 0, ref9 = m; 0 <= ref9 ? aa < ref9 : aa > ref9; k = 0 <= ref9 ? ++aa : --aa) {
        ref10 = [E[k][row], E[k][maxRow]], E[k][maxRow] = ref10[0], E[k][row] = ref10[1];
      }
      pivots.push([row, col]);
      colBasis.push(orig[col]);
      lastPivot = row;
      pivot = M[col][row];
      for (k = ab = ref11 = row + 1, ref12 = m; ref11 <= ref12 ? ab < ref12 : ab > ref12; k = ref11 <= ref12 ? ++ab : --ab) {
        c = M[col][k] / pivot;
        if (c === 0) {
          continue;
        }
        M[col][k] = 0;
        for (j = ac = ref13 = col + 1, ref14 = n; ref13 <= ref14 ? ac < ref14 : ac > ref14; j = ref13 <= ref14 ? ++ac : --ac) {
          M[j][k] -= c * M[j][row];
        }
        for (j = ad = 0, ref15 = m; 0 <= ref15 ? ad < ref15 : ad > ref15; j = 0 <= ref15 ? ++ad : --ad) {
          E[j][k] -= c * E[j][row];
        }
      }
      row++;
      col++;
    }
    ref16 = pivots.reverse();
    for (ae = 0, len = ref16.length; ae < len; ae++) {
      ref17 = ref16[ae], row = ref17[0], col = ref17[1];
      pivot = M[col][row];
      M[col][row] = 1;
      for (k = af = ref18 = col + 1, ref19 = n; ref18 <= ref19 ? af < ref19 : af > ref19; k = ref18 <= ref19 ? ++af : --af) {
        M[k][row] /= pivot;
      }
      for (k = ag = 0, ref20 = m; 0 <= ref20 ? ag < ref20 : ag > ref20; k = 0 <= ref20 ? ++ag : --ag) {
        E[k][row] /= pivot;
      }
      for (k = ah = 0, ref21 = row; 0 <= ref21 ? ah < ref21 : ah > ref21; k = 0 <= ref21 ? ++ah : --ah) {
        c = M[col][k];
        M[col][k] = 0;
        for (j = ai = ref22 = col + 1, ref23 = n; ref22 <= ref23 ? ai < ref23 : ai > ref23; j = ref22 <= ref23 ? ++ai : --ai) {
          M[j][k] -= c * M[j][row];
        }
        for (j = aj = 0, ref24 = m; 0 <= ref24 ? aj < ref24 : aj > ref24; j = 0 <= ref24 ? ++aj : --aj) {
          E[j][k] -= c * E[j][row];
        }
      }
    }
    fn = function() {
      var al, len2, ref25, vec;
      vec = (function() {
        var al, ref25, results;
        results = [];
        for (al = 0, ref25 = n; 0 <= ref25 ? al < ref25 : al > ref25; 0 <= ref25 ? al++ : al--) {
          results.push(0);
        }
        return results;
      })();
      vec[i] = 1;
      for (al = 0, len2 = pivots.length; al < len2; al++) {
        ref25 = pivots[al], row = ref25[0], col = ref25[1];
        vec[col] = -M[i][row];
      }
      return nulBasis.push(vec);
    };
    for (ak = 0, len1 = noPivots.length; ak < len1; ak++) {
      i = noPivots[ak];
      fn();
    }
    f = function(b) {
      var Eb, al, am, an, ao, len2, ref25, ref26, ref27, ref28, ref29, ret, x;
      Eb = [];
      for (i = al = 0, ref25 = m; 0 <= ref25 ? al < ref25 : al > ref25; i = 0 <= ref25 ? ++al : --al) {
        x = 0;
        for (j = am = 0, ref26 = m; 0 <= ref26 ? am < ref26 : am > ref26; j = 0 <= ref26 ? ++am : --am) {
          x += E[j][i] * b[j];
        }
        Eb.push(x);
      }
      for (i = an = ref27 = lastPivot + 1, ref28 = n; ref27 <= ref28 ? an < ref28 : an > ref28; i = ref27 <= ref28 ? ++an : --an) {
        if (Math.abs(Eb[i]) > 0.000001) {
          return null;
        }
      }
      ret = (function() {
        var ao, ref29, results;
        results = [];
        for (ao = 0, ref29 = n; 0 <= ref29 ? ao < ref29 : ao > ref29; 0 <= ref29 ? ao++ : ao--) {
          results.push(0);
        }
        return results;
      })();
      for (ao = 0, len2 = pivots.length; ao < len2; ao++) {
        ref29 = pivots[ao], row = ref29[0], col = ref29[1];
        ret[col] = Eb[row];
      }
      return ret;
    };
    return [nulBasis, colBasis, E, f];
  };

  urlParams = {};

  decodeQS = function() {
    var decode, match, pl, query, search;
    pl = /\+/g;
    search = /([^&=]+)=?([^&]*)/g;
    decode = function(s) {
      return decodeURIComponent(s.replace(pl, " "));
    };
    query = window.location.search.substring(1);
    urlParams = {};
    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  };

  decodeQS();

  clipShader = "// Enable STPQ mapping\n#define POSITION_STPQ\nvoid getPosition(inout vec4 xyzw, inout vec4 stpq) {\n  // Store XYZ per vertex in STPQ\nstpq = xyzw;\n}";

  clipFragment = "// Enable STPQ mapping\n#define POSITION_STPQ\nuniform float range;\nuniform int hilite;\n\nvec4 getColor(vec4 rgba, inout vec4 stpq) {\n    stpq = abs(stpq);\n\n    // Discard pixels outside of clip box\n    if(stpq.x > range || stpq.y > range || stpq.z > range)\n        discard;\n\n    if(hilite != 0 &&\n       (range - stpq.x < range * 0.002 ||\n        range - stpq.y < range * 0.002 ||\n        range - stpq.z < range * 0.002)) {\n        rgba.xyz *= 10.0;\n        rgba.w = 1.0;\n    }\n\n    return rgba;\n}";

  Subspace = (function() {
    function Subspace(opts1) {
      var i, l, ref, ref1, ref2;
      this.opts = opts1;
      this.updateDim = bind(this.updateDim, this);
      this.draw = bind(this.draw, this);
      this.project = bind(this.project, this);
      this.update = bind(this.update, this);
      this.setVecs = bind(this.setVecs, this);
      this.onDimChange = (ref = this.opts.onDimChange) != null ? ref : function() {};
      this.ortho = [new THREE.Vector3(), new THREE.Vector3()];
      this.zeroThreshold = (ref1 = this.opts.zeroThreshold) != null ? ref1 : 0.00001;
      this.numVecs = this.opts.vectors.length;
      this.vectors = [];
      for (i = l = 0, ref2 = this.numVecs; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        this.vectors[i] = makeTvec(this.opts.vectors[i]);
      }
      this.tmpVec1 = new THREE.Vector3();
      this.tmpVec2 = new THREE.Vector3();
      this.drawn = false;
      this.dim = -1;
      this.update();
    }

    Subspace.prototype.setVecs = function(vecs) {
      var i, l, ref;
      for (i = l = 0, ref = this.numVecs; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        setTvec(this.vectors[i], vecs[i]);
      }
      return this.update();
    };

    Subspace.prototype.update = function() {
      var cross, oldDim, ortho1, ortho2, ref, ref1, vec1, vec1Zero, vec2, vec2Zero, vec3;
      ref = this.vectors, vec1 = ref[0], vec2 = ref[1], vec3 = ref[2];
      ref1 = this.ortho, ortho1 = ref1[0], ortho2 = ref1[1];
      cross = this.tmpVec1;
      oldDim = this.dim;
      switch (this.numVecs) {
        case 0:
          this.dim = 0;
          break;
        case 1:
          if (vec1.lengthSq() <= this.zeroThreshold) {
            this.dim = 0;
          } else {
            this.dim = 1;
            ortho1.copy(vec1).normalize();
          }
          break;
        case 2:
          cross.crossVectors(vec1, vec2);
          if (cross.lengthSq() <= this.zeroThreshold) {
            vec1Zero = vec1.lengthSq() <= this.zeroThreshold;
            vec2Zero = vec2.lengthSq() <= this.zeroThreshold;
            if (vec1Zero && vec2Zero) {
              this.dim = 0;
            } else if (vec1Zero) {
              this.dim = 1;
              ortho1.copy(vec2).normalize();
            } else {
              this.dim = 1;
              ortho1.copy(vec1).normalize();
            }
          } else {
            this.dim = 2;
            orthogonalize(ortho1.copy(vec1), ortho2.copy(vec2));
          }
          break;
        case 3:
          cross.crossVectors(vec1, vec2);
          if (Math.abs(cross.dot(vec3)) > this.zeroThreshold) {
            this.dim = 3;
          } else {
            if (cross.lengthSq() > this.zeroThreshold) {
              this.dim = 2;
              orthogonalize(ortho1.copy(vec1), ortho2.copy(vec2));
            } else {
              cross.crossVectors(vec1, vec3);
              if (cross.lengthSq() > this.zeroThreshold) {
                this.dim = 2;
                orthogonalize(ortho1.copy(vec1), ortho2.copy(vec3));
              } else {
                cross.crossVectors(vec2, vec3);
                if (cross.lengthSq() > this.zeroThreshold) {
                  this.dim = 2;
                  orthogonalize(ortho1.copy(vec2), ortho2.copy(vec3));
                } else if (vec1.lengthSq() > this.zeroThreshold) {
                  this.dim = 1;
                  ortho1.copy(vec1);
                } else if (vec2.lengthSq() > this.zeroThreshold) {
                  this.dim = 1;
                  ortho1.copy(vec2);
                } else if (vec3.lengthSq() > this.zeroThreshold) {
                  this.dim = 1;
                  ortho1.copy(vec3);
                } else {
                  this.dim = 0;
                }
              }
            }
          }
      }
      if (oldDim !== this.dim) {
        return this.updateDim(oldDim);
      }
    };

    Subspace.prototype.project = function(vec, projected) {
      var ortho1, ortho2, ref;
      vec = setTvec(this.tmpVec1, vec);
      ref = this.ortho, ortho1 = ref[0], ortho2 = ref[1];
      switch (this.dim) {
        case 0:
          return projected.set(0, 0, 0);
        case 1:
          return projected.copy(ortho1).multiplyScalar(ortho1.dot(vec));
        case 2:
          projected.copy(ortho1).multiplyScalar(ortho1.dot(vec));
          this.tmpVec2.copy(ortho2).multiplyScalar(ortho2.dot(vec));
          return projected.add(this.tmpVec2);
        case 3:
          return projected.copy(vec);
      }
    };

    Subspace.prototype.draw = function(view) {
      var color, lineOpts, live, name, pointOpts, ref, ref1, ref2, ref3, ref4, ref5, ref6, surfaceOpts;
      name = (ref = this.opts.name) != null ? ref : 'subspace';
      this.range = (ref1 = this.opts.range) != null ? ref1 : 10.0;
      color = (ref2 = this.opts.color) != null ? ref2 : 0x880000;
      live = (ref3 = this.opts.live) != null ? ref3 : true;
      this.range *= 2;
      pointOpts = {
        id: name + "-point",
        classes: [name],
        color: color,
        opacity: 1.0,
        size: 15,
        visible: false
      };
      extend(pointOpts, (ref4 = this.opts.pointOpts) != null ? ref4 : {});
      lineOpts = {
        id: name + "-line",
        classes: [name],
        color: 0x880000,
        opacity: 1.0,
        stroke: 'solid',
        width: 5,
        visible: false
      };
      extend(lineOpts, (ref5 = this.opts.lineOpts) != null ? ref5 : {});
      surfaceOpts = {
        id: name + "-plane",
        classes: [name],
        color: color,
        opacity: 0.5,
        lineX: false,
        lineY: false,
        fill: true,
        visible: false
      };
      extend(surfaceOpts, (ref6 = this.opts.surfaceOpts) != null ? ref6 : {});
      if (live || this.dim === 0) {
        view.array({
          channels: 3,
          width: 1,
          live: live,
          data: [[0, 0, 0]]
        });
        this.point = view.point(pointOpts);
      }
      if ((live && this.numVecs >= 1) || this.dim === 1) {
        view.array({
          channels: 3,
          width: 2,
          live: live,
          expr: (function(_this) {
            return function(emit, i) {
              if (i === 0) {
                return emit(-_this.ortho[0].x * _this.range, -_this.ortho[0].y * _this.range, -_this.ortho[0].z * _this.range);
              } else {
                return emit(_this.ortho[0].x * _this.range, _this.ortho[0].y * _this.range, _this.ortho[0].z * _this.range);
              }
            };
          })(this)
        });
        this.line = view.line(lineOpts);
      }
      if ((live && this.numVecs >= 2) || this.dim === 2) {
        if (!this.opts.noPlane) {
          view.matrix({
            channels: 3,
            width: 2,
            height: 2,
            live: live,
            expr: (function(_this) {
              return function(emit, i, j) {
                var sign1, sign2;
                sign1 = i === 0 ? -1 : 1;
                sign2 = j === 0 ? -1 : 1;
                return emit(sign1 * _this.ortho[0].x * _this.range + sign2 * _this.ortho[1].x * _this.range, sign1 * _this.ortho[0].y * _this.range + sign2 * _this.ortho[1].y * _this.range, sign1 * _this.ortho[0].z * _this.range + sign2 * _this.ortho[1].z * _this.range);
              };
            })(this)
          });
          this.plane = view.surface(surfaceOpts);
        }
      }
      this.objects = [this.point, this.line, this.plane];
      this.drawn = true;
      return this.updateDim(-1);
    };

    Subspace.prototype.updateDim = function(oldDim) {
      this.onDimChange(this);
      if (!this.drawn) {
        return;
      }
      if (oldDim >= 0 && oldDim < 3 && (this.objects[oldDim] != null)) {
        this.objects[oldDim].set('visible', false);
      }
      if (this.dim < 3 && (this.objects[this.dim] != null)) {
        return this.objects[this.dim].set('visible', true);
      }
    };

    return Subspace;

  })();

  LinearCombo = (function() {
    function LinearCombo(view, opts) {
      var c, coeffVars, coeffs, color1, color2, color3, colors, combine, l, labelOpts, labels, len, lineOpts, name, numVecs, pointOpts, ref, ref1, ref2, ref3, ref4, vec, vector1, vector2, vector3, vectors;
      name = (ref = opts.name) != null ? ref : 'lincombo';
      vectors = opts.vectors;
      colors = opts.colors;
      labels = opts.labels;
      coeffs = opts.coeffs;
      coeffVars = (ref1 = opts.coeffVars) != null ? ref1 : ['x', 'y', 'z'];
      c = function(i) {
        return coeffs[coeffVars[i]];
      };
      lineOpts = {
        classes: [name],
        points: "#" + name + "-points",
        colors: "#" + name + "-colors",
        color: "white",
        opacity: 0.75,
        width: 3,
        zIndex: 1
      };
      extend(lineOpts, (ref2 = opts.lineOpts) != null ? ref2 : {});
      pointOpts = {
        classes: [name],
        points: "#" + name + "-combo",
        color: 0x00ffff,
        zIndex: 2,
        size: 15
      };
      extend(pointOpts, (ref3 = opts.pointOpts) != null ? ref3 : {});
      labelOpts = {
        classes: [name],
        outline: 2,
        background: "black",
        color: 0x00ffff,
        offset: [0, 25],
        zIndex: 3,
        size: 15
      };
      extend(labelOpts, (ref4 = opts.labelOpts) != null ? ref4 : {});
      numVecs = vectors.length;
      for (l = 0, len = vectors.length; l < len; l++) {
        vec = vectors[l];
        if (vec[2] == null) {
          vec[2] = 0;
        }
      }
      vector1 = vectors[0];
      vector2 = vectors[1];
      vector3 = vectors[2];
      color1 = colors[0];
      color2 = colors[1];
      color3 = colors[2];
      switch (numVecs) {
        case 1:
          combine = (function(_this) {
            return function() {
              return _this.combo = [vector1[0] * c(0), vector1[1] * c(0), vector1[2] * c(0)];
            };
          })(this);
          view.array({
            id: name + "-points",
            channels: 3,
            width: 2,
            items: 1,
            expr: function(emit, i) {
              if (i === 0) {
                return emit(0, 0, 0);
              } else {
                return emit(vector1[0] * c(0), vector1[1] * c(0), vector1[2] * c(0));
              }
            }
          }).array({
            id: name + "-colors",
            channels: 4,
            width: 1,
            items: 1,
            data: [color1]
          }).array({
            id: name + "-combo",
            channels: 3,
            width: 1,
            expr: function(emit) {
              return emit.apply(null, combine());
            }
          });
          break;
        case 2:
          combine = (function(_this) {
            return function() {
              return _this.combo = [vector1[0] * c(0) + vector2[0] * c(1), vector1[1] * c(0) + vector2[1] * c(1), vector1[2] * c(0) + vector2[2] * c(1)];
            };
          })(this);
          view.array({
            id: name + "-points",
            channels: 3,
            width: 2,
            items: 4,
            expr: function(emit, i) {
              var vec1, vec12, vec2;
              vec1 = [vector1[0] * c(0), vector1[1] * c(0), vector1[2] * c(0)];
              vec2 = [vector2[0] * c(1), vector2[1] * c(1), vector2[2] * c(1)];
              vec12 = [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
              if (i === 0) {
                emit(0, 0, 0);
                emit(0, 0, 0);
                emit.apply(null, vec1);
                return emit.apply(null, vec2);
              } else {
                emit.apply(null, vec1);
                emit.apply(null, vec2);
                emit.apply(null, vec12);
                return emit.apply(null, vec12);
              }
            }
          }).array({
            id: name + "-colors",
            channels: 4,
            width: 2,
            items: 4,
            data: [color1, color2, color2, color1, color1, color2, color2, color1]
          }).array({
            id: name + "-combo",
            channels: 3,
            width: 1,
            expr: function(emit) {
              return emit.apply(null, combine());
            }
          });
          break;
        case 3:
          combine = (function(_this) {
            return function() {
              return _this.combo = [vector1[0] * c(0) + vector2[0] * c(1) + vector3[0] * c(2), vector1[1] * c(0) + vector2[1] * c(1) + vector3[1] * c(2), vector1[2] * c(0) + vector2[2] * c(1) + vector3[2] * c(2)];
            };
          })(this);
          view.array({
            id: name + "-points",
            channels: 3,
            width: 2,
            items: 12,
            expr: function(emit, i) {
              var vec1, vec12, vec123, vec13, vec2, vec23, vec3;
              vec1 = [vector1[0] * c(0), vector1[1] * c(0), vector1[2] * c(0)];
              vec2 = [vector2[0] * c(1), vector2[1] * c(1), vector2[2] * c(1)];
              vec3 = [vector3[0] * c(2), vector3[1] * c(2), vector3[2] * c(2)];
              vec12 = [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
              vec13 = [vec1[0] + vec3[0], vec1[1] + vec3[1], vec1[2] + vec3[2]];
              vec23 = [vec2[0] + vec3[0], vec2[1] + vec3[1], vec2[2] + vec3[2]];
              vec123 = [vec1[0] + vec2[0] + vec3[0], vec1[1] + vec2[1] + vec3[1], vec1[2] + vec2[2] + vec3[2]];
              if (i === 0) {
                emit(0, 0, 0);
                emit(0, 0, 0);
                emit(0, 0, 0);
                emit.apply(null, vec1);
                emit.apply(null, vec1);
                emit.apply(null, vec2);
                emit.apply(null, vec2);
                emit.apply(null, vec3);
                emit.apply(null, vec3);
                emit.apply(null, vec12);
                emit.apply(null, vec13);
                return emit.apply(null, vec23);
              } else {
                emit.apply(null, vec1);
                emit.apply(null, vec2);
                emit.apply(null, vec3);
                emit.apply(null, vec12);
                emit.apply(null, vec13);
                emit.apply(null, vec12);
                emit.apply(null, vec23);
                emit.apply(null, vec13);
                emit.apply(null, vec23);
                emit.apply(null, vec123);
                emit.apply(null, vec123);
                return emit.apply(null, vec123);
              }
            }
          }).array({
            id: name + "-colors",
            channels: 4,
            width: 2,
            items: 12,
            data: [color1, color2, color3, color2, color3, color1, color3, color1, color2, color3, color2, color1, color1, color2, color3, color2, color3, color1, color3, color1, color2, color3, color2, color1]
          }).array({
            id: name + "-combo",
            channels: 3,
            width: 1,
            expr: function(emit) {
              return emit.apply(null, combine());
            }
          });
      }
      view.line(lineOpts).point(pointOpts).text({
        live: true,
        width: 1,
        expr: function(emit) {
          var add, b, cc, ret;
          ret = c(0).toFixed(2) + labels[0];
          if (numVecs >= 2) {
            b = Math.abs(c(1));
            add = c(1) >= 0 ? "+" : "-";
            ret += add + b.toFixed(2) + labels[1];
          }
          if (numVecs >= 3) {
            cc = Math.abs(c(2));
            add = c(2) >= 0 ? "+" : "-";
            ret += add + cc.toFixed(2) + labels[2];
          }
          return emit(ret);
        }
      }).label(labelOpts);
      this.combine = combine;
    }

    return LinearCombo;

  })();

  Grid = (function() {
    function Grid(view, opts) {
      var doLines, l, len, lineOpts, live, name, numLines, numVecs, perSide, ref, ref1, ref2, ref3, ref4, ticksOpts, totLines, vec, vector1, vector2, vector3, vectors;
      name = (ref = opts.name) != null ? ref : "vecgrid";
      vectors = opts.vectors;
      numLines = (ref1 = opts.numLines) != null ? ref1 : 40;
      live = (ref2 = opts.live) != null ? ref2 : true;
      ticksOpts = {
        id: name,
        opacity: 1,
        size: 20,
        normal: false,
        color: 0xcc0000
      };
      extend(ticksOpts, (ref3 = opts.ticksOpts) != null ? ref3 : {});
      lineOpts = {
        id: name,
        opacity: .75,
        stroke: 'solid',
        width: 3,
        color: 0x880000,
        zBias: 2
      };
      extend(lineOpts, (ref4 = opts.lineOpts) != null ? ref4 : {});
      numVecs = vectors.length;
      for (l = 0, len = vectors.length; l < len; l++) {
        vec = vectors[l];
        if (vec[2] == null) {
          vec[2] = 0;
        }
      }
      vector1 = vectors[0], vector2 = vectors[1], vector3 = vectors[2];
      perSide = numLines / 2;
      if (numVecs === 1) {
        view.array({
          channels: 3,
          live: live,
          width: numLines + 1,
          expr: function(emit, i) {
            i -= perSide;
            return emit(i * vector1[0], i * vector1[1], i * vector1[2]);
          }
        });
        this.ticks = view.ticks(ticksOpts);
        return;
      }
      if (numVecs === 2) {
        totLines = (numLines + 1) * 2;
        doLines = function(emit, i) {
          var j, q, ref5, ref6, results, start;
          results = [];
          for (j = q = ref5 = -perSide, ref6 = perSide; ref5 <= ref6 ? q <= ref6 : q >= ref6; j = ref5 <= ref6 ? ++q : --q) {
            start = i === 0 ? -perSide : perSide;
            emit(start * vector1[0] + j * vector2[0], start * vector1[1] + j * vector2[1], start * vector1[2] + j * vector2[2]);
            results.push(emit(start * vector2[0] + j * vector1[0], start * vector2[1] + j * vector1[1], start * vector2[2] + j * vector1[2]));
          }
          return results;
        };
      }
      if (numVecs === 3) {
        totLines = (numLines + 1) * (numLines + 1) * 3;
        doLines = function(emit, i) {
          var j, k, q, ref5, ref6, results, start;
          results = [];
          for (j = q = ref5 = -perSide, ref6 = perSide; ref5 <= ref6 ? q <= ref6 : q >= ref6; j = ref5 <= ref6 ? ++q : --q) {
            results.push((function() {
              var ref7, ref8, results1, u;
              results1 = [];
              for (k = u = ref7 = -perSide, ref8 = perSide; ref7 <= ref8 ? u <= ref8 : u >= ref8; k = ref7 <= ref8 ? ++u : --u) {
                start = i === 0 ? -perSide : perSide;
                emit(start * vector1[0] + j * vector2[0] + k * vector3[0], start * vector1[1] + j * vector2[1] + k * vector3[1], start * vector1[2] + j * vector2[2] + k * vector3[2]);
                emit(start * vector2[0] + j * vector1[0] + k * vector3[0], start * vector2[1] + j * vector1[1] + k * vector3[1], start * vector2[2] + j * vector1[2] + k * vector3[2]);
                results1.push(emit(start * vector3[0] + j * vector1[0] + k * vector2[0], start * vector3[1] + j * vector1[1] + k * vector2[1], start * vector3[2] + j * vector1[2] + k * vector2[2]));
              }
              return results1;
            })());
          }
          return results;
        };
      }
      view.array({
        channels: 3,
        live: live,
        width: 2,
        items: totLines,
        expr: doLines
      });
      this.lines = view.line(lineOpts);
    }

    return Grid;

  })();

  Caption = (function() {
    function Caption(mathbox, text) {
      this.mathbox = mathbox;
      this.div = this.mathbox._context.overlays.div;
      this.label = document.createElement('div');
      this.label.className = "overlay-text";
      this.label.innerHTML = text;
      this.div.appendChild(this.label);
    }

    return Caption;

  })();

  Popup = (function() {
    function Popup(mathbox, text) {
      this.mathbox = mathbox;
      this.div = this.mathbox._context.overlays.div;
      this.popup = document.createElement('div');
      this.popup.className = "overlay-popup";
      this.popup.style.display = 'none';
      if (text != null) {
        this.popup.innerHTML = text;
      }
      this.div.appendChild(this.popup);
    }

    Popup.prototype.show = function(text) {
      if (text != null) {
        this.popup.innerHTML = text;
      }
      return this.popup.style.display = '';
    };

    Popup.prototype.hide = function() {
      return this.popup.style.display = 'none';
    };

    return Popup;

  })();

  View = (function() {
    function View(mathbox, opts1) {
      var axisOpts, doAxes, doAxisLabels, doGrid, gridOpts, i, l, labelOpts, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, viewOpts, viewRange, viewScale;
      this.mathbox = mathbox;
      this.opts = opts1;
      if (this.opts == null) {
        this.opts = {};
      }
      this.name = (ref = this.opts.name) != null ? ref : "view";
      viewRange = (ref1 = this.opts.viewRange) != null ? ref1 : [[-10, 10], [-10, 10], [-10, 10]];
      this.numDims = viewRange.length;
      viewScale = (ref2 = this.opts.viewScale) != null ? ref2 : [1, 1, 1];
      doAxes = (ref3 = this.opts.axes) != null ? ref3 : true;
      axisOpts = {
        classes: [this.name + "-axes"],
        end: true,
        width: 3,
        depth: 1,
        color: "white",
        opacity: 0.75,
        zBias: -1,
        size: 5
      };
      extend(axisOpts, (ref4 = this.opts.axisOpts) != null ? ref4 : {});
      doGrid = (ref5 = this.opts.grid) != null ? ref5 : true;
      gridOpts = {
        classes: [this.name + "-axes", this.name + "-grid"],
        axes: [1, 2],
        width: 2,
        depth: 1,
        color: "white",
        opacity: 0.5,
        zBias: 0
      };
      extend(gridOpts, (ref6 = this.opts.gridOpts) != null ? ref6 : {});
      doAxisLabels = ((ref7 = this.opts.axisLabels) != null ? ref7 : true) && doAxes;
      labelOpts = {
        classes: [this.name + "-axes"],
        size: 20,
        color: "white",
        opacity: 1,
        outline: 2,
        background: "black",
        offset: [0, 0]
      };
      extend(labelOpts, (ref8 = this.opts.labelOpts) != null ? ref8 : {});
      if (this.numDims === 3) {
        viewScale[0] = -viewScale[0];
        viewOpts = {
          range: viewRange,
          scale: viewScale,
          rotation: [-π / 2, 0, 0],
          id: this.name + "-view"
        };
      } else {
        viewOpts = {
          range: viewRange,
          scale: viewScale,
          id: this.name + "-view"
        };
      }
      extend(viewOpts, (ref9 = this.opts.viewOpts) != null ? ref9 : {});
      this.view = this.mathbox.cartesian(viewOpts);
      if (doAxes) {
        for (i = l = 1, ref10 = this.numDims; 1 <= ref10 ? l <= ref10 : l >= ref10; i = 1 <= ref10 ? ++l : --l) {
          axisOpts.axis = i;
          this.view.axis(axisOpts);
        }
      }
      if (doGrid) {
        this.view.grid(gridOpts);
      }
      if (doAxisLabels) {
        this.view.array({
          channels: this.numDims,
          width: this.numDims,
          live: false,
          expr: (function(_this) {
            return function(emit, i) {
              var arr, j, q, ref11;
              arr = [];
              for (j = q = 0, ref11 = _this.numDims; 0 <= ref11 ? q < ref11 : q > ref11; j = 0 <= ref11 ? ++q : --q) {
                if (i === j) {
                  arr.push(viewRange[i][1] * 1.04);
                } else {
                  arr.push(0);
                }
              }
              return emit.apply(null, arr);
            };
          })(this)
        }).text({
          live: false,
          width: this.numDims,
          data: ['x', 'y', 'z'].slice(0, this.numDims)
        }).label(labelOpts);
      }
    }

    return View;

  })();

  Draggable = (function() {
    function Draggable(view1, opts1) {
      var getMatrix, hiliteColor, hiliteOpts, i, indices, l, len, name, point, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, rtt, size;
      this.view = view1;
      this.opts = opts1;
      this.getIndexAt = bind(this.getIndexAt, this);
      this.post = bind(this.post, this);
      this.onMouseUp = bind(this.onMouseUp, this);
      this.onMouseMove = bind(this.onMouseMove, this);
      this.onMouseDown = bind(this.onMouseDown, this);
      if (this.opts == null) {
        this.opts = {};
      }
      name = (ref = this.opts.name) != null ? ref : "draggable";
      this.points = this.opts.points;
      size = (ref1 = this.opts.size) != null ? ref1 : 30;
      this.onDrag = (ref2 = this.opts.onDrag) != null ? ref2 : function() {};
      this.postDrag = (ref3 = this.opts.postDrag) != null ? ref3 : function() {};
      this.is2D = (ref4 = this.opts.is2D) != null ? ref4 : false;
      hiliteColor = (ref5 = this.opts.hiliteColor) != null ? ref5 : [0, .5, .5, .75];
      this.eyeMatrix = (ref6 = this.opts.eyeMatrix) != null ? ref6 : new THREE.Matrix4();
      getMatrix = (ref7 = this.opts.getMatrix) != null ? ref7 : function(d) {
        return d.view[0].controller.viewMatrix;
      };
      hiliteOpts = {
        id: name + "-hilite",
        color: "white",
        points: "#" + name + "-points",
        colors: "#" + name + "-colors",
        size: size,
        zIndex: 2,
        zTest: false,
        zWrite: false
      };
      extend(hiliteOpts, (ref8 = this.opts.hiliteOpts) != null ? ref8 : {});
      this.three = this.view._context.api.three;
      this.canvas = this.three.canvas;
      this.camera = this.view._context.api.select("camera")[0].controller.camera;
      ref9 = this.points;
      for (l = 0, len = ref9.length; l < len; l++) {
        point = ref9[l];
        if (point[2] == null) {
          point[2] = 0;
        }
      }
      this.hovered = -1;
      this.dragging = -1;
      this.mouse = [-1, -1];
      this.activePoint = void 0;
      this.projected = new THREE.Vector3();
      this.vector = new THREE.Vector3();
      this.matrix = new THREE.Matrix4();
      this.matrixInv = new THREE.Matrix4();
      this.scale = 1 / 4;
      this.viewMatrix = getMatrix(this);
      this.viewMatrixInv = new THREE.Matrix4().getInverse(this.viewMatrix);
      this.viewMatrixTrans = this.viewMatrix.clone().transpose();
      this.eyeMatrixTrans = this.eyeMatrix.clone().transpose();
      this.eyeMatrixInv = new THREE.Matrix4().getInverse(this.eyeMatrix);
      indices = (function() {
        var q, ref10, results;
        results = [];
        for (i = q = 0, ref10 = this.points.length; 0 <= ref10 ? q < ref10 : q > ref10; i = 0 <= ref10 ? ++q : --q) {
          results.push([(i + 1) / 255, 1.0, 0, 0]);
        }
        return results;
      }).call(this);
      this.view.array({
        id: name + "-points",
        channels: 3,
        width: this.points.length,
        data: this.points
      }).array({
        id: name + "-index",
        channels: 4,
        width: this.points.length,
        data: indices,
        live: false
      });
      rtt = this.view.rtt({
        id: name + "-rtt",
        size: 'relative',
        width: this.scale,
        height: this.scale
      });
      rtt.transform({
        pass: 'eye',
        matrix: Array.prototype.slice.call(this.eyeMatrixTrans.elements)
      }).transform({
        matrix: Array.prototype.slice.call(this.viewMatrixTrans.elements)
      }).point({
        points: "#" + name + "-points",
        colors: "#" + name + "-index",
        color: 'white',
        size: size,
        blending: 'no'
      }).end();
      this.view.array({
        id: name + "-colors",
        channels: 4,
        width: this.points.length,
        expr: (function(_this) {
          return function(emit, i, t) {
            if (_this.dragging === i || _this.hovered === i) {
              return emit.apply(null, hiliteColor);
            } else {
              return emit(1, 1, 1, 0);
            }
          };
        })(this)
      }).point(hiliteOpts);
      this.readback = this.view.readback({
        source: "#" + name + "-rtt",
        type: 'unsignedByte'
      });
      this.canvas.addEventListener('mousedown', this.onMouseDown, false);
      this.canvas.addEventListener('mousemove', this.onMouseMove, false);
      this.canvas.addEventListener('mouseup', this.onMouseUp, false);
      this.three.on('post', this.post);
    }

    Draggable.prototype.onMouseDown = function(event) {
      if (this.hovered < 0) {
        return;
      }
      event.preventDefault();
      this.dragging = this.hovered;
      return this.activePoint = this.points[this.dragging];
    };

    Draggable.prototype.onMouseMove = function(event) {
      var mouseX, mouseY;
      this.mouse = [event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio];
      this.hovered = this.getIndexAt(this.mouse[0], this.mouse[1]);
      if (this.dragging < 0) {
        return;
      }
      event.preventDefault();
      mouseX = event.offsetX / this.canvas.offsetWidth * 2 - 1.0;
      mouseY = -(event.offsetY / this.canvas.offsetHeight * 2 - 1.0);
      this.projected.set(this.activePoint[0], this.activePoint[1], this.activePoint[2]).applyMatrix4(this.viewMatrix);
      this.matrix.multiplyMatrices(this.camera.projectionMatrix, this.eyeMatrix);
      this.matrix.multiply(this.matrixInv.getInverse(this.camera.matrixWorld));
      this.projected.applyProjection(this.matrix);
      this.vector.set(mouseX, mouseY, this.projected.z);
      this.vector.applyProjection(this.matrixInv.getInverse(this.matrix));
      this.vector.applyMatrix4(this.viewMatrixInv);
      if (this.is2D) {
        this.vector.z = 0;
      }
      this.onDrag.call(this, this.vector);
      this.activePoint[0] = this.vector.x;
      this.activePoint[1] = this.vector.y;
      this.activePoint[2] = this.vector.z;
      return this.postDrag.call(this);
    };

    Draggable.prototype.onMouseUp = function(event) {
      if (this.dragging < 0) {
        return;
      }
      event.preventDefault();
      this.dragging = -1;
      return this.activePoint = void 0;
    };

    Draggable.prototype.post = function() {
      if (this.dragging >= 0) {
        this.canvas.style.cursor = 'pointer';
      } else if (this.hovered >= 0) {
        this.canvas.style.cursor = 'pointer';
      } else if (this.three.controls) {
        this.canvas.style.cursor = 'move';
      } else {
        this.canvas.style.cursor = '';
      }
      if (this.three.controls) {
        return this.three.controls.enabled = this.hovered < 0 && this.dragging < 0;
      }
    };

    Draggable.prototype.getIndexAt = function(x, y) {
      var a, data, h, o, r, w;
      data = this.readback.get('data');
      if (!data) {
        return -1;
      }
      x = Math.floor(x * this.scale);
      y = Math.floor(y * this.scale);
      w = this.readback.get('width');
      h = this.readback.get('height');
      o = (x + w * (h - y - 1)) * 4;
      r = data[o];
      a = data[o + 3];
      if (r != null) {
        if (a === 0) {
          return r - 1;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    };

    return Draggable;

  })();

  ClipCube = (function() {
    function ClipCube(view1, opts1) {
      var color, draw, hilite, material, pass, range, ref, ref1, ref2, ref3, ref4, ref5;
      this.view = view1;
      this.opts = opts1;
      if (this.opts == null) {
        this.opts = {};
      }
      range = (ref = this.opts.range) != null ? ref : 1.0;
      pass = (ref1 = this.opts.pass) != null ? ref1 : "world";
      hilite = (ref2 = this.opts.hilite) != null ? ref2 : true;
      draw = (ref3 = this.opts.draw) != null ? ref3 : false;
      if (draw) {
        material = (ref4 = this.opts.material) != null ? ref4 : new THREE.MeshBasicMaterial();
        color = (ref5 = this.opts.color) != null ? ref5 : new THREE.Color(1, 1, 1);
        this.mesh = (function(_this) {
          return function() {
            var cube, geo, mesh;
            geo = new THREE.BoxGeometry(2, 2, 2);
            mesh = new THREE.Mesh(geo, material);
            cube = new THREE.BoxHelper(mesh);
            cube.material.color = color;
            _this.view._context.api.three.scene.add(cube);
            return mesh;
          };
        })(this)();
      }
      this.uniforms = {
        range: {
          type: 'f',
          value: range
        },
        hilite: {
          type: 'i',
          value: hilite ? 1 : 0
        }
      };
      this.clipped = this.view.shader({
        code: clipShader
      }).vertex({
        pass: pass
      }).shader({
        code: clipFragment,
        uniforms: this.uniforms
      }).fragment();
    }

    return ClipCube;

  })();

  LabeledVectors = (function() {
    function LabeledVectors(view, opts1) {
      var colors, doZero, i, l, labelOpts, labels, len, len1, live, name, origins, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, u, vec, vectorData, vectorOpts, vectors, zeroData, zeroOpts, zeroThreshold;
      this.opts = opts1;
      this.show = bind(this.show, this);
      this.hide = bind(this.hide, this);
      if (this.opts == null) {
        this.opts = {};
      }
      name = (ref = this.opts.name) != null ? ref : "labeled";
      vectors = this.opts.vectors;
      colors = this.opts.colors;
      labels = this.opts.labels;
      origins = (ref1 = this.opts.origins) != null ? ref1 : (function() {
        var l, ref2, results;
        results = [];
        for (l = 0, ref2 = vectors.length; 0 <= ref2 ? l < ref2 : l > ref2; 0 <= ref2 ? l++ : l--) {
          results.push([0, 0, 0]);
        }
        return results;
      })();
      live = (ref2 = this.opts.live) != null ? ref2 : true;
      vectorOpts = {
        id: name + "-vectors-drawn",
        classes: [name],
        points: "#" + name + "-vectors",
        colors: "#" + name + "-colors",
        color: "white",
        end: true,
        size: 5,
        width: 5
      };
      extend(vectorOpts, (ref3 = this.opts.vectorOpts) != null ? ref3 : {});
      labelOpts = {
        id: name + "-vector-labels",
        classes: [name],
        colors: "#" + name + "-colors",
        color: "white",
        outline: 2,
        background: "black",
        size: 15,
        offset: [0, 25]
      };
      extend(labelOpts, (ref4 = this.opts.labelOpts) != null ? ref4 : {});
      doZero = (ref5 = this.opts.zeroPoints) != null ? ref5 : false;
      zeroOpts = {
        id: name + "-zero-points",
        classes: [name],
        points: "#" + name + "-zeros",
        colors: "#" + name + "-zero-colors",
        color: "white",
        size: 20
      };
      extend(zeroOpts, (ref6 = this.opts.zeroOpts) != null ? ref6 : {});
      zeroThreshold = (ref7 = this.opts.zeroThreshold) != null ? ref7 : 0.0;
      this.hidden = false;
      vectorData = [];
      for (l = 0, len = vectors.length; l < len; l++) {
        vec = vectors[l];
        if (vec[2] == null) {
          vec[2] = 0;
        }
      }
      for (q = 0, len1 = origins.length; q < len1; q++) {
        vec = origins[q];
        if (vec[2] == null) {
          vec[2] = 0;
        }
      }
      for (i = u = 0, ref8 = vectors.length; 0 <= ref8 ? u < ref8 : u > ref8; i = 0 <= ref8 ? ++u : --u) {
        vectorData.push(origins[i]);
        vectorData.push(vectors[i]);
      }
      view.array({
        id: name + "-vectors",
        channels: 3,
        width: vectors.length,
        items: 2,
        data: vectorData,
        live: live
      }).array({
        id: name + "-colors",
        channels: 4,
        width: colors.length,
        data: colors,
        live: live
      });
      this.vecs = view.vector(vectorOpts);
      if (labels != null) {
        view.array({
          channels: 3,
          width: vectors.length,
          expr: function(emit, i) {
            return emit((vectors[i][0] + origins[i][0]) / 2, (vectors[i][1] + origins[i][1]) / 2, (vectors[i][2] + origins[i][2]) / 2);
          },
          live: live
        }).text({
          id: name + "-text",
          live: false,
          width: labels.length,
          data: labels
        });
        this.labels = view.label(labelOpts);
      }
      if (doZero) {
        zeroData = (function() {
          var ref9, results, v;
          results = [];
          for (v = 0, ref9 = vectors.length; 0 <= ref9 ? v < ref9 : v > ref9; 0 <= ref9 ? v++ : v--) {
            results.push([0, 0, 0]);
          }
          return results;
        })();
        view.array({
          id: name + "-zero-colors",
          channels: 4,
          width: vectors.length,
          live: live,
          expr: function(emit, i) {
            if (vectors[i][0] * vectors[i][0] + vectors[i][1] * vectors[i][1] + vectors[i][2] * vectors[i][2] <= zeroThreshold * zeroThreshold) {
              return emit.apply(null, colors[i]);
            } else {
              return emit(0, 0, 0, 0);
            }
          }
        }).array({
          id: name + "-zeros",
          channels: 3,
          width: vectors.length,
          data: zeroData,
          live: false
        });
        this.zeroPoints = view.point(zeroOpts);
        this.zeroPoints.bind('visible', (function(_this) {
          return function() {
            var ref9, v;
            if (_this.hidden) {
              return false;
            }
            for (i = v = 0, ref9 = vectors.length; 0 <= ref9 ? v < ref9 : v > ref9; i = 0 <= ref9 ? ++v : --v) {
              if (vectors[i][0] * vectors[i][0] + vectors[i][1] * vectors[i][1] + vectors[i][2] * vectors[i][2] <= zeroThreshold * zeroThreshold) {
                return true;
              }
            }
            return false;
          };
        })(this));
      }
    }

    LabeledVectors.prototype.hide = function() {
      var ref;
      if (this.hidden) {
        return;
      }
      this.hidden = true;
      this.vecs.set('visible', false);
      return (ref = this.labels) != null ? ref.set('visible', false) : void 0;
    };

    LabeledVectors.prototype.show = function() {
      var ref;
      if (!this.hidden) {
        return;
      }
      this.hidden = false;
      this.vecs.set('visible', true);
      return (ref = this.labels) != null ? ref.set('visible', true) : void 0;
    };

    return LabeledVectors;

  })();

  Demo = (function() {
    function Demo(opts1, callback) {
      var cameraOpts, clearColor, clearOpacity, doFullScreen, focusDist, image, key, mathboxOpts, onPreloaded, p, preload, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, scaleUI, toPreload, value;
      this.opts = opts1;
      this.texCombo = bind(this.texCombo, this);
      this.texSet = bind(this.texSet, this);
      this.urlParams = urlParams;
      if (this.opts == null) {
        this.opts = {};
      }
      mathboxOpts = {
        plugins: ['core', 'controls', 'cursor'],
        controls: {
          klass: THREE.OrbitControls,
          parameters: {
            noKeys: true
          }
        },
        mathbox: {
          inspect: false
        },
        splash: {
          fancy: true,
          color: "blue"
        }
      };
      extend(mathboxOpts, (ref = this.opts.mathbox) != null ? ref : {});
      clearColor = (ref1 = this.opts.clearColor) != null ? ref1 : 0x000000;
      clearOpacity = (ref2 = this.opts.clearOpacity) != null ? ref2 : 1.0;
      cameraOpts = {
        proxy: true,
        position: [3, 1.5, 1.5],
        lookAt: [0, 0, 0]
      };
      extend(cameraOpts, (ref3 = this.opts.camera) != null ? ref3 : {});
      if (((ref4 = this.opts.cameraPosFromQS) != null ? ref4 : true) && (this.urlParams.camera != null)) {
        cameraOpts.position = this.urlParams.camera.split(",").map(parseFloat);
      }
      p = cameraOpts.position;
      cameraOpts.position = [-p[0], p[2], -p[1]];
      focusDist = (ref5 = this.opts.focusDist) != null ? ref5 : 1.5;
      scaleUI = (ref6 = this.opts.scaleUI) != null ? ref6 : true;
      doFullScreen = (ref7 = this.opts.fullscreen) != null ? ref7 : true;
      this.dims = (ref8 = this.opts.dims) != null ? ref8 : 3;
      onPreloaded = (function(_this) {
        return function() {
          _this.mathbox = mathBox(mathboxOpts);
          _this.three = _this.mathbox.three;
          _this.three.renderer.setClearColor(new THREE.Color(clearColor), clearOpacity);
          _this.camera = _this.mathbox.camera(cameraOpts)[0].controller.camera;
          _this.canvas = _this.mathbox._context.canvas;
          if (scaleUI) {
            _this.mathbox.bind('focus', function() {
              return focusDist / 1000 * Math.min(_this.canvas.clientWidth, _this.canvas.clientHeight);
            });
          } else {
            _this.mathbox.set('focus', focusDist);
          }
          if (doFullScreen) {
            document.body.addEventListener('keypress', function(event) {
              if (event.charCode === 'f'.charCodeAt(0 && screenfull.enabled)) {
                return screenfull.toggle();
              }
            });
          }
          return callback.apply(_this);
        };
      })(this);
      preload = (ref9 = this.opts.preload) != null ? ref9 : {};
      toPreload = 0;
      if (preload) {
        for (key in preload) {
          value = preload[key];
          toPreload++;
          image = new Image();
          this[key] = image;
          image.src = value;
          image.addEventListener('load', function() {
            if (--toPreload === 0) {
              return onPreloaded();
            }
          });
        }
      }
      if (!(toPreload > 0)) {
        onPreloaded();
      }
    }

    Demo.prototype.texVector = function(vec, opts) {
      var coord, dim, i, l, len, precision, ref, ref1, ret;
      if (opts == null) {
        opts = {};
      }
      precision = (ref = opts.precision) != null ? ref : 2;
      dim = (ref1 = opts.dim) != null ? ref1 : this.dims;
      vec = vec.slice(0, dim);
      if (precision >= 0) {
        for (i = l = 0, len = vec.length; l < len; i = ++l) {
          coord = vec[i];
          vec[i] = coord.toFixed(precision);
        }
      }
      ret = '';
      if (opts.color != null) {
        ret += "\\color{" + opts.color + "}{";
      }
      ret += "\\begin{bmatrix}";
      ret += vec.join("\\\\");
      ret += "\\end{bmatrix}";
      if (opts.color != null) {
        ret += "}";
      }
      return ret;
    };

    Demo.prototype.texSet = function(vecs, opts) {
      var colors, i, l, len, precision, ref, str, vec;
      if (opts == null) {
        opts = {};
      }
      colors = opts.colors;
      precision = (ref = opts.precision) != null ? ref : 2;
      str = "\\left\\{";
      for (i = l = 0, len = vecs.length; l < len; i = ++l) {
        vec = vecs[i];
        if (colors != null) {
          opts.color = colors[i];
        }
        str += this.texVector(vec, opts);
        if (i + 1 < vecs.length) {
          str += ",\\,";
        }
      }
      return str + "\\right\\}";
    };

    Demo.prototype.texCombo = function(vecs, coeffs, opts) {
      var colors, i, l, len, precision, ref, str, vec;
      if (opts == null) {
        opts = {};
      }
      colors = opts.colors;
      precision = (ref = opts.precision) != null ? ref : 2;
      str = '';
      for (i = l = 0, len = vecs.length; l < len; i = ++l) {
        vec = vecs[i];
        if (coeffs[i] !== 1) {
          if (coeffs[i] === -1) {
            str += '-';
          } else {
            str += coeffs[i].toFixed(precision);
          }
        }
        if (colors != null) {
          opts.color = colors[i];
        }
        str += this.texVector(vec, opts);
        if (i + 1 < vecs.length && coeffs[i + 1] >= 0) {
          str += ' + ';
        }
      }
      return str;
    };

    Demo.prototype.texMatrix = function(cols, opts) {
      var colors, i, j, l, m, n, precision, q, ref, ref1, ref2, ref3, ref4, str;
      if (opts == null) {
        opts = {};
      }
      colors = opts.colors;
      precision = (ref = opts.precision) != null ? ref : 2;
      m = (ref1 = opts.rows) != null ? ref1 : this.dims;
      n = (ref2 = opts.cols) != null ? ref2 : cols.length;
      str = "\\begin{bmatrix}";
      for (i = l = 0, ref3 = m; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        for (j = q = 0, ref4 = n; 0 <= ref4 ? q < ref4 : q > ref4; j = 0 <= ref4 ? ++q : --q) {
          if (colors != null) {
            str += "\\color{" + colors[j] + "}{";
          }
          if (precision >= 0) {
            str += cols[j][i].toFixed(precision);
          } else {
            str += cols[j][i];
          }
          if (colors != null) {
            str += "}";
          }
          if (j + 1 < n) {
            str += "&";
          }
        }
        if (i + 1 < m) {
          str += "\\\\";
        }
      }
      return str += "\\end{bmatrix}";
    };

    Demo.prototype.moveCamera = function(x, y, z) {
      return this.camera.position.set(-x, z, -y);
    };

    Demo.prototype.rowred = function(mat, opts) {
      return rowReduce(mat, opts);
    };

    Demo.prototype.view = function(opts) {
      var r;
      if (opts == null) {
        opts = {};
      }
      if (this.urlParams.range != null) {
        r = parseFloat(this.urlParams.range);
        if (opts.viewRange == null) {
          opts.viewRange = [[-r, r], [-r, r], [-r, r]];
        }
      }
      return new View(this.mathbox, opts).view;
    };

    Demo.prototype.caption = function(text) {
      return new Caption(this.mathbox, text);
    };

    Demo.prototype.popup = function(text) {
      return new Popup(this.mathbox, text);
    };

    Demo.prototype.clipCube = function(view, opts) {
      return new ClipCube(view, opts);
    };

    Demo.prototype.draggable = function(view, opts) {
      return new Draggable(view, opts);
    };

    Demo.prototype.linearCombo = function(view, opts) {
      return new LinearCombo(view, opts);
    };

    Demo.prototype.grid = function(view, opts) {
      return new Grid(view, opts);
    };

    Demo.prototype.labeledVectors = function(view, opts) {
      return new LabeledVectors(view, opts);
    };

    Demo.prototype.subspace = function(opts) {
      return new Subspace(opts);
    };

    return Demo;

  })();

  Demo2D = (function(superClass) {
    extend1(Demo2D, superClass);

    function Demo2D(opts, callback) {
      var base, base1, base2, base3, base4, base5, base6, base7, base8, ortho, ref, ref1, vertical;
      if (opts == null) {
        opts = {};
      }
      if (opts.dims == null) {
        opts.dims = 2;
      }
      if (opts.mathbox == null) {
        opts.mathbox = {};
      }
      if ((base = opts.mathbox).plugins == null) {
        base.plugins = ['core'];
      }
      ortho = (ref = opts.ortho) != null ? ref : 10000;
      if ((base1 = opts.mathbox).camera == null) {
        base1.camera = {};
      }
      if ((base2 = opts.mathbox.camera).near == null) {
        base2.near = ortho / 4;
      }
      if ((base3 = opts.mathbox.camera).far == null) {
        base3.far = ortho * 4;
      }
      if (opts.camera == null) {
        opts.camera = {};
      }
      if ((base4 = opts.camera).proxy == null) {
        base4.proxy = false;
      }
      if ((base5 = opts.camera).position == null) {
        base5.position = [0, -ortho, 0];
      }
      if ((base6 = opts.camera).lookAt == null) {
        base6.lookAt = [0, 0, 0];
      }
      if ((base7 = opts.camera).up == null) {
        base7.up = [1, 0, 0];
      }
      vertical = (ref1 = opts.vertical) != null ? ref1 : 1.1;
      if ((base8 = opts.camera).fov == null) {
        base8.fov = Math.atan(vertical / ortho) * 360 / π;
      }
      if (opts.focusDist == null) {
        opts.focusDist = ortho / 1.5;
      }
      Demo2D.__super__.constructor.call(this, opts, callback);
    }

    Demo2D.prototype.view = function(opts) {
      var r;
      if (opts == null) {
        opts = {};
      }
      if (this.urlParams.range != null) {
        r = parseFloat(this.urlParams.range);
        if (opts.viewRange == null) {
          opts.viewRange = [[-r, r], [-r, r]];
        }
      } else {
        if (opts.viewRange == null) {
          opts.viewRange = [[-10, 10], [-10, 10]];
        }
      }
      return new View(this.mathbox, opts).view;
    };

    Demo2D.prototype.draggable = function(view, opts) {
      if (opts == null) {
        opts = {};
      }
      if (opts.is2D == null) {
        opts.is2D = true;
      }
      return new Draggable(view, opts);
    };

    return Demo2D;

  })(Demo);

  window.Demo = Demo;

  window.Demo2D = Demo2D;

  window.urlParams = urlParams;

}).call(this);