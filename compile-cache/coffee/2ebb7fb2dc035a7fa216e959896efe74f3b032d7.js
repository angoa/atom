(function() {
  var ColorExpression, ExpressionsRegistry, SVGColors, colorRegexp, colors, comma, elmAngle, float, floatOrPercent, hexadecimal, insensitive, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, ref, ref1, registry, strip, variables;

  ref = require('./regexes'), int = ref.int, float = ref.float, percent = ref.percent, optionalPercent = ref.optionalPercent, intOrPercent = ref.intOrPercent, floatOrPercent = ref.floatOrPercent, comma = ref.comma, notQuote = ref.notQuote, hexadecimal = ref.hexadecimal, ps = ref.ps, pe = ref.pe, variables = ref.variables, namePrefixes = ref.namePrefixes;

  ref1 = require('./utils'), strip = ref1.strip, insensitive = ref1.insensitive;

  ExpressionsRegistry = require('./expressions-registry');

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  module.exports = registry = new ExpressionsRegistry(ColorExpression);

  registry.createExpression('pigments:css_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", 1, ['css', 'less', 'styl', 'stylus', 'sass', 'scss'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hexRGBA = hexa;
  });

  registry.createExpression('pigments:argb_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:css_hexa_6', "#(" + hexadecimal + "{6})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_hexa_4', "(?:" + namePrefixes + ")#(" + hexadecimal + "{4})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, colorAsInt, hexa;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 12 & 0xf) * 17;
    this.green = (colorAsInt >> 8 & 0xf) * 17;
    this.blue = (colorAsInt >> 4 & 0xf) * 17;
    return this.alpha = ((colorAsInt & 0xf) * 17) / 255;
  });

  registry.createExpression('pigments:css_hexa_3', "(?:" + namePrefixes + ")#(" + hexadecimal + "{3})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, colorAsInt, hexa;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 8 & 0xf) * 17;
    this.green = (colorAsInt >> 4 & 0xf) * 17;
    return this.blue = (colorAsInt & 0xf) * 17;
  });

  registry.createExpression('pigments:int_hexa_8', "0x(" + hexadecimal + "{8})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:int_hexa_6', "0x(" + hexadecimal + "{6})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_rgb', strip("" + (insensitive('rgb')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_rgba', strip("" + (insensitive('rgba')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:stylus_rgba', strip("rgba" + ps + "\\s* (" + notQuote + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, baseColor, subexpr;
    _ = match[0], subexpr = match[1], a = match[2];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:css_hsl', strip("" + (insensitive('hsl')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['css', 'sass', 'scss', 'styl', 'stylus'], function(match, expression, context) {
    var _, h, hsl, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:less_hsl', strip("hsl" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['less'], function(match, expression, context) {
    var _, h, hsl, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloatOrPercent(s) * 100, context.readFloatOrPercent(l) * 100];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_hsla', strip("" + (insensitive('hsla')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, h, hsl, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hsv', strip("(?:" + (insensitive('hsv')) + "|" + (insensitive('hsb')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, h, hsv, s, v;
    _ = match[0], h = match[1], s = match[2], v = match[3];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hsva', strip("(?:" + (insensitive('hsva')) + "|" + (insensitive('hsba')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, h, hsv, s, v;
    _ = match[0], h = match[1], s = match[2], v = match[3], a = match[4];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hcg', strip("(?:" + (insensitive('hcg')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, c, gr, h, hcg;
    _ = match[0], h = match[1], c = match[2], gr = match[3];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hcga', strip("(?:" + (insensitive('hcga')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, c, gr, h, hcg;
    _ = match[0], h = match[1], c = match[2], gr = match[3], a = match[4];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:vec4', strip("vec4" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, h, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    return this.rgba = [context.readFloat(h) * 255, context.readFloat(s) * 255, context.readFloat(l) * 255, context.readFloat(a)];
  });

  registry.createExpression('pigments:hwb', strip("" + (insensitive('hwb')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), ['*'], function(match, expression, context) {
    var _, a, b, h, w;
    _ = match[0], h = match[1], w = match[2], b = match[3], a = match[4];
    this.hwb = [context.readInt(h), context.readFloat(w), context.readFloat(b)];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  registry.createExpression('pigments:cmyk', strip("" + (insensitive('cmyk')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, c, k, m, y;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    return this.cmyk = [context.readFloat(c), context.readFloat(m), context.readFloat(y), context.readFloat(k)];
  });

  registry.createExpression('pigments:gray', strip("" + (insensitive('gray')) + ps + "\\s* (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), 1, ['*'], function(match, expression, context) {
    var _, a, p;
    _ = match[0], p = match[1], a = match[2];
    p = context.readFloat(p) / 100 * 255;
    this.rgb = [p, p, p];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  colors = Object.keys(SVGColors.allCases);

  colorRegexp = "(?:" + namePrefixes + ")(" + (colors.join('|')) + ")\\b(?![ \\t]*[-\\.:=\\(])";

  registry.createExpression('pigments:named_colors', colorRegexp, [], function(match, expression, context) {
    var _, name;
    _ = match[0], name = match[1];
    this.colorExpression = this.name = name;
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:darken', strip("darken" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, s, context.clampInt(l - amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:lighten', strip("lighten" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, s, context.clampInt(l + amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:fade', strip("(?:fade|alpha)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = amount;
  });

  registry.createExpression('pigments:transparentize', strip("(?:transparentize|fadeout|fade-out|fade_out)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha - amount);
  });

  registry.createExpression('pigments:opacify', strip("(?:opacify|fadein|fade-in|fade_in)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha + amount);
  });

  registry.createExpression('pigments:stylus_component_functions', strip("(red|green|blue)" + ps + " (" + notQuote + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, channel, subexpr;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    return this[channel] = amount;
  });

  registry.createExpression('pigments:transparentify', strip("transparentify" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var _, alpha, bestAlpha, bottom, expr, processChannel, ref2, top;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), top = ref2[0], bottom = ref2[1], alpha = ref2[2];
    top = context.readColor(top);
    bottom = context.readColor(bottom);
    alpha = context.readFloatOrPercent(alpha);
    if (context.isInvalid(top)) {
      return this.invalid = true;
    }
    if ((bottom != null) && context.isInvalid(bottom)) {
      return this.invalid = true;
    }
    if (bottom == null) {
      bottom = new context.Color(255, 255, 255, 1);
    }
    if (isNaN(alpha)) {
      alpha = void 0;
    }
    bestAlpha = ['red', 'green', 'blue'].map(function(channel) {
      var res;
      res = (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
      return res;
    }).sort(function(a, b) {
      return a < b;
    })[0];
    processChannel = function(channel) {
      if (bestAlpha === 0) {
        return bottom[channel];
      } else {
        return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
      }
    };
    if (alpha != null) {
      bestAlpha = alpha;
    }
    bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
    this.red = processChannel('red');
    this.green = processChannel('green');
    this.blue = processChannel('blue');
    return this.alpha = Math.round(bestAlpha * 100) / 100;
  });

  registry.createExpression('pigments:hue', strip("hue" + ps + " (" + notQuote + ") " + comma + " (" + int + "deg|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [amount % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:stylus_sl_component_functions', strip("(saturation|lightness)" + ps + " (" + notQuote + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, channel, subexpr;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    baseColor[channel] = amount;
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:adjust-hue', strip("adjust-hue" + ps + " (" + notQuote + ") " + comma + " (-?" + int + "deg|" + variables + "|-?" + optionalPercent + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(h + amount) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:mix', "mix" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, amount, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1], amount = ref2[2];
    if (amount != null) {
      amount = context.readFloatOrPercent(amount);
    } else {
      amount = 0.5;
    }
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = context.mixColors(baseColor1, baseColor2, amount), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:stylus_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var _, amount, baseColor, subexpr, white;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:stylus_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var _, amount, baseColor, black, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:compass_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var _, amount, baseColor, subexpr, white;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(baseColor, white, amount).rgba;
  });

  registry.createExpression('pigments:compass_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var _, amount, baseColor, black, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(baseColor, black, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var _, amount, baseColor, subexpr, white;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var _, amount, baseColor, black, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:desaturate', "desaturate" + ps + "(" + notQuote + ")" + comma + "(" + floatOrPercent + "|" + variables + ")" + pe, ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, context.clampInt(s - amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:saturate', strip("saturate" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, context.clampInt(s + amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:grayscale', "gr(?:a|e)yscale" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, 0, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:invert', "invert" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, b, baseColor, g, r, ref2, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.rgb, r = ref2[0], g = ref2[1], b = ref2[2];
    this.rgb = [255 - r, 255 - g, 255 - b];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:complement', "complement" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:spin', strip("spin" + ps + " (" + notQuote + ") " + comma + " (-?(" + int + ")(deg)?|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, angle, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], angle = match[2];
    baseColor = context.readColor(subexpr);
    angle = context.readInt(angle);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(360 + h + angle) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:contrast_n_arguments', strip("contrast" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, base, baseColor, dark, expr, light, ref2, ref3, res, threshold;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), base = ref2[0], dark = ref2[1], light = ref2[2], threshold = ref2[3];
    baseColor = context.readColor(base);
    dark = context.readColor(dark);
    light = context.readColor(light);
    if (threshold != null) {
      threshold = context.readPercent(threshold);
    }
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (dark != null ? dark.invalid : void 0) {
      return this.invalid = true;
    }
    if (light != null ? light.invalid : void 0) {
      return this.invalid = true;
    }
    res = context.contrast(baseColor, dark, light);
    if (context.isInvalid(res)) {
      return this.invalid = true;
    }
    return ref3 = context.contrast(baseColor, dark, light, threshold), this.rgb = ref3.rgb, ref3;
  });

  registry.createExpression('pigments:contrast_1_argument', strip("contrast" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var _, baseColor, ref2, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    return ref2 = context.contrast(baseColor), this.rgb = ref2.rgb, ref2;
  });

  registry.createExpression('pigments:css_color_function', "(?:" + namePrefixes + ")(" + (insensitive('color')) + ps + "(" + notQuote + ")" + pe + ")", ['css'], function(match, expression, context) {
    var _, cssColor, e, expr, k, ref2, rgba, v;
    try {
      _ = match[0], expr = match[1];
      ref2 = context.vars;
      for (k in ref2) {
        v = ref2[k];
        expr = expr.replace(RegExp("" + (k.replace(/\(/g, '\\(').replace(/\)/g, '\\)')), "g"), v.value);
      }
      cssColor = require('css-color-function');
      rgba = cssColor.convert(expr.toLowerCase());
      this.rgba = context.readColor(rgba).rgba;
      return this.colorExpression = expr;
    } catch (error) {
      e = error;
      return this.invalid = true;
    }
  });

  registry.createExpression('pigments:sass_adjust_color', "adjust-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var _, baseColor, i, len, param, params, res, subexpr, subject;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      context.readParam(param, function(name, value) {
        return baseColor[name] += context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_scale_color', "scale-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var MAX_PER_COMPONENT, _, baseColor, i, len, param, params, res, subexpr, subject;
    MAX_PER_COMPONENT = {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1,
      hue: 360,
      saturation: 100,
      lightness: 100
    };
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      context.readParam(param, function(name, value) {
        var dif, result;
        value = context.readFloat(value) / 100;
        result = value > 0 ? (dif = MAX_PER_COMPONENT[name] - baseColor[name], result = baseColor[name] + dif * value) : result = baseColor[name] * (1 + value);
        return baseColor[name] = result;
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_change_color', "change-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var _, baseColor, i, len, param, params, res, subexpr, subject;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      context.readParam(param, function(name, value) {
        return baseColor[name] = context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:stylus_blend', strip("blend" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return this.rgba = [baseColor1.red * baseColor1.alpha + baseColor2.red * (1 - baseColor1.alpha), baseColor1.green * baseColor1.alpha + baseColor2.green * (1 - baseColor1.alpha), baseColor1.blue * baseColor1.alpha + baseColor2.blue * (1 - baseColor1.alpha), baseColor1.alpha + baseColor2.alpha - baseColor1.alpha * baseColor2.alpha];
  });

  registry.createExpression('pigments:lua_rgba', strip("(?:" + namePrefixes + ")Color" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['lua'], function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readInt(a) / 255;
  });

  registry.createExpression('pigments:multiply', strip("multiply" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.MULTIPLY), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:screen', strip("screen" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.SCREEN), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:overlay', strip("overlay" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.OVERLAY), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:softlight', strip("softlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.SOFT_LIGHT), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:hardlight', strip("hardlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.HARD_LIGHT), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:difference', strip("difference" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.DIFFERENCE), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:exclusion', strip("exclusion" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.EXCLUSION), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:average', strip("average" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.AVERAGE), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:negation', strip("negation" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.NEGATION), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:elm_rgba', strip("rgba\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_rgb', strip("rgb\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    return this.blue = context.readInt(b);
  });

  elmAngle = "(?:" + float + "|\\(degrees\\s+(?:" + int + "|" + variables + ")\\))";

  registry.createExpression('pigments:elm_hsl', strip("hsl\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, elmDegreesRegexp, h, hsl, l, m, s;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:elm_hsla', strip("hsla\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, a, elmDegreesRegexp, h, hsl, l, m, s;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_grayscale', "gr(?:a|e)yscale\\s+(" + float + "|" + variables + ")", ['elm'], function(match, expression, context) {
    var _, amount;
    _ = match[0], amount = match[1];
    amount = Math.floor(255 - context.readFloat(amount) * 255);
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:elm_complement', strip("complement\\s+(" + notQuote + ")"), ['elm'], function(match, expression, context) {
    var _, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:latex_gray', strip("\\[gray\\]\\{(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var _, amount;
    _ = match[0], amount = match[1];
    amount = context.readFloat(amount) * 255;
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:latex_html', strip("\\[HTML\\]\\{(" + hexadecimal + "{6})\\}"), ['tex'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:latex_rgb', strip("\\[rgb\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = Math.floor(context.readFloat(r) * 255);
    g = Math.floor(context.readFloat(g) * 255);
    b = Math.floor(context.readFloat(b) * 255);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_RGB', strip("\\[RGB\\]\\{(" + int + ")" + comma + "(" + int + ")" + comma + "(" + int + ")\\}"), ['tex'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = context.readInt(r);
    g = context.readInt(g);
    b = context.readInt(b);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_cmyk', strip("\\[cmyk\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var _, c, k, m, y;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    c = context.readFloat(c);
    m = context.readFloat(m);
    y = context.readFloat(y);
    k = context.readFloat(k);
    return this.cmyk = [c, m, y, k];
  });

  registry.createExpression('pigments:latex_predefined', strip('\\{(black|blue|brown|cyan|darkgray|gray|green|lightgray|lime|magenta|olive|orange|pink|purple|red|teal|violet|white|yellow)\\}'), ['tex'], function(match, expression, context) {
    var _, name;
    _ = match[0], name = match[1];
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_predefined_dvipnames', strip('\\{(Apricot|Aquamarine|Bittersweet|Black|Blue|BlueGreen|BlueViolet|BrickRed|Brown|BurntOrange|CadetBlue|CarnationPink|Cerulean|CornflowerBlue|Cyan|Dandelion|DarkOrchid|Emerald|ForestGreen|Fuchsia|Goldenrod|Gray|Green|GreenYellow|JungleGreen|Lavender|LimeGreen|Magenta|Mahogany|Maroon|Melon|MidnightBlue|Mulberry|NavyBlue|OliveGreen|Orange|OrangeRed|Orchid|Peach|Periwinkle|PineGreen|Plum|ProcessBlue|Purple|RawSienna|Red|RedOrange|RedViolet|Rhodamine|RoyalBlue|RoyalPurple|RubineRed|Salmon|SeaGreen|Sepia|SkyBlue|SpringGreen|Tan|TealBlue|Thistle|Turquoise|Violet|VioletRed|White|WildStrawberry|Yellow|YellowGreen|YellowOrange)\\}'), ['tex'], function(match, expression, context) {
    var _, name;
    _ = match[0], name = match[1];
    return this.hex = context.DVIPnames[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_mix', strip('\\{([^!\\n\\}]+[!][^\\}\\n]+)\\}'), ['tex'], function(match, expression, context) {
    var _, expr, mix, nextColor, op, triplet;
    _ = match[0], expr = match[1];
    op = expr.split('!');
    mix = function(arg) {
      var a, b, colorA, colorB, p;
      a = arg[0], p = arg[1], b = arg[2];
      colorA = a instanceof context.Color ? a : context.readColor("{" + a + "}");
      colorB = b instanceof context.Color ? b : context.readColor("{" + b + "}");
      percent = context.readInt(p);
      return context.mixColors(colorA, colorB, percent / 100);
    };
    if (op.length === 2) {
      op.push(new context.Color(255, 255, 255));
    }
    nextColor = null;
    while (op.length > 0) {
      triplet = op.splice(0, 3);
      nextColor = mix(triplet);
      if (op.length > 0) {
        op.unshift(nextColor);
      }
    }
    return this.rgb = nextColor.rgb;
  });

  registry.createExpression('pigments:qt_rgba', strip("Qt\\.rgba" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['qml', 'c', 'cc', 'cpp'], 1, function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readFloat(r) * 255;
    this.green = context.readFloat(g) * 255;
    this.blue = context.readFloat(b) * 255;
    return this.alpha = context.readFloat(a);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FuZ29hLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1leHByZXNzaW9ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BY0ksT0FBQSxDQUFRLFdBQVIsQ0FkSixFQUNFLGFBREYsRUFFRSxpQkFGRixFQUdFLHFCQUhGLEVBSUUscUNBSkYsRUFLRSwrQkFMRixFQU1FLG1DQU5GLEVBT0UsaUJBUEYsRUFRRSx1QkFSRixFQVNFLDZCQVRGLEVBVUUsV0FWRixFQVdFLFdBWEYsRUFZRSx5QkFaRixFQWFFOztFQUdGLE9BQXVCLE9BQUEsQ0FBUSxTQUFSLENBQXZCLEVBQUMsa0JBQUQsRUFBUTs7RUFFUixtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVI7O0VBQ3RCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBRVosTUFBTSxDQUFDLE9BQVAsR0FDQSxRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixlQUFwQjs7RUFXZixRQUFRLENBQUMsZ0JBQVQsQ0FBMEIscUJBQTFCLEVBQWlELElBQUEsR0FBSyxXQUFMLEdBQWlCLG1CQUFsRSxFQUFzRixDQUF0RixFQUF5RixDQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCLEVBQXdCLFFBQXhCLEVBQWtDLE1BQWxDLEVBQTBDLE1BQTFDLENBQXpGLEVBQTRJLFNBQUMsS0FBRCxFQUFRLFVBQVIsRUFBb0IsT0FBcEI7QUFDMUksUUFBQTtJQUFDLFlBQUQsRUFBSTtXQUVKLElBQUMsQ0FBQSxPQUFELEdBQVc7RUFIK0gsQ0FBNUk7O0VBTUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLHNCQUExQixFQUFrRCxJQUFBLEdBQUssV0FBTCxHQUFpQixtQkFBbkUsRUFBdUYsQ0FBQyxHQUFELENBQXZGLEVBQThGLFNBQUMsS0FBRCxF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RUFBbUIsS0FBbkIsQ0FWSixFQVUrQixDQVYvQixFQVVrQyxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLE9BQXBCO0FBQ2hDLFFBQUE7SUFBQyxZQUFELEVBQUcsWUFBSCxFQUFLLFlBQUwsRUFBTyxZQUFQLEVBQVM7SUFFVCxJQUFDLENBQUEsR0FBRCxHQUFPLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQWxCLENBQUEsR0FBdUI7SUFDOUIsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFsQixDQUFBLEdBQXVCO0lBQ2hDLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsQ0FBbEIsQ0FBQSxHQUF1QjtXQUMvQixJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQWxCO0VBTnVCLENBVmxDO0FBdDZDQSIsInNvdXJjZXNDb250ZW50IjpbIntcbiAgaW50XG4gIGZsb2F0XG4gIHBlcmNlbnRcbiAgb3B0aW9uYWxQZXJjZW50XG4gIGludE9yUGVyY2VudFxuICBmbG9hdE9yUGVyY2VudFxuICBjb21tYVxuICBub3RRdW90ZVxuICBoZXhhZGVjaW1hbFxuICBwc1xuICBwZVxuICB2YXJpYWJsZXNcbiAgbmFtZVByZWZpeGVzXG59ID0gcmVxdWlyZSAnLi9yZWdleGVzJ1xuXG57c3RyaXAsIGluc2Vuc2l0aXZlfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbkV4cHJlc3Npb25zUmVnaXN0cnkgPSByZXF1aXJlICcuL2V4cHJlc3Npb25zLXJlZ2lzdHJ5J1xuQ29sb3JFeHByZXNzaW9uID0gcmVxdWlyZSAnLi9jb2xvci1leHByZXNzaW9uJ1xuU1ZHQ29sb3JzID0gcmVxdWlyZSAnLi9zdmctY29sb3JzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5yZWdpc3RyeSA9IG5ldyBFeHByZXNzaW9uc1JlZ2lzdHJ5KENvbG9yRXhwcmVzc2lvbilcblxuIyMgICAgIyMgICAgICAgIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAgICAgIyMjICAgICMjXG4jIyAgICAjIyAgICAgICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICAjIyAgICMjICMjICAgIyNcbiMjICAgICMjICAgICAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjICAjI1xuIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyMjIyMgICAjIyMjIyMjIyAgIyMgICAgICMjICMjXG4jIyAgICAjIyAgICAgICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgIyMgICAjIyMjIyMjIyMgIyNcbiMjICAgICMjICAgICAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICMjICAgICAjIyAjI1xuIyMgICAgIyMjIyMjIyMgIyMjIyAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyMjXG5cbiMgIzZmMzQ4OWVmXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjc3NfaGV4YV84JywgXCIjKCN7aGV4YWRlY2ltYWx9ezh9KSg/IVtcXFxcZFxcXFx3LV0pXCIsIDEsIFsnY3NzJywgJ2xlc3MnLCAnc3R5bCcsICdzdHlsdXMnLCAnc2FzcycsICdzY3NzJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGhleGFdID0gbWF0Y2hcblxuICBAaGV4UkdCQSA9IGhleGFcblxuIyAjNmYzNDg5ZWZcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmFyZ2JfaGV4YV84JywgXCIjKCN7aGV4YWRlY2ltYWx9ezh9KSg/IVtcXFxcZFxcXFx3LV0pXCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG5cbiAgQGhleEFSR0IgPSBoZXhhXG5cbiMgIzM0ODllZlxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y3NzX2hleGFfNicsIFwiIygje2hleGFkZWNpbWFsfXs2fSkoPyFbXFxcXGRcXFxcdy1dKVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgaGV4YV0gPSBtYXRjaFxuXG4gIEBoZXggPSBoZXhhXG5cbiMgIzZmMzRcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19oZXhhXzQnLCBcIig/OiN7bmFtZVByZWZpeGVzfSkjKCN7aGV4YWRlY2ltYWx9ezR9KSg/IVtcXFxcZFxcXFx3LV0pXCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG4gIGNvbG9yQXNJbnQgPSBjb250ZXh0LnJlYWRJbnQoaGV4YSwgMTYpXG5cbiAgQGNvbG9yRXhwcmVzc2lvbiA9IFwiIyN7aGV4YX1cIlxuICBAcmVkID0gKGNvbG9yQXNJbnQgPj4gMTIgJiAweGYpICogMTdcbiAgQGdyZWVuID0gKGNvbG9yQXNJbnQgPj4gOCAmIDB4ZikgKiAxN1xuICBAYmx1ZSA9IChjb2xvckFzSW50ID4+IDQgJiAweGYpICogMTdcbiAgQGFscGhhID0gKChjb2xvckFzSW50ICYgMHhmKSAqIDE3KSAvIDI1NVxuXG4jICMzOGVcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19oZXhhXzMnLCBcIig/OiN7bmFtZVByZWZpeGVzfSkjKCN7aGV4YWRlY2ltYWx9ezN9KSg/IVtcXFxcZFxcXFx3LV0pXCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG4gIGNvbG9yQXNJbnQgPSBjb250ZXh0LnJlYWRJbnQoaGV4YSwgMTYpXG5cbiAgQGNvbG9yRXhwcmVzc2lvbiA9IFwiIyN7aGV4YX1cIlxuICBAcmVkID0gKGNvbG9yQXNJbnQgPj4gOCAmIDB4ZikgKiAxN1xuICBAZ3JlZW4gPSAoY29sb3JBc0ludCA+PiA0ICYgMHhmKSAqIDE3XG4gIEBibHVlID0gKGNvbG9yQXNJbnQgJiAweGYpICogMTdcblxuIyAweGFiMzQ4OWVmXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czppbnRfaGV4YV84JywgXCIweCgje2hleGFkZWNpbWFsfXs4fSkoPyEje2hleGFkZWNpbWFsfSlcIiwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGhleGFdID0gbWF0Y2hcblxuICBAaGV4QVJHQiA9IGhleGFcblxuIyAweDM0ODllZlxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aW50X2hleGFfNicsIFwiMHgoI3toZXhhZGVjaW1hbH17Nn0pKD8hI3toZXhhZGVjaW1hbH0pXCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG5cbiAgQGhleCA9IGhleGFcblxuIyByZ2IoNTAsMTIwLDIwMClcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19yZ2InLCBzdHJpcChcIlxuICAje2luc2Vuc2l0aXZlICdyZ2InfSN7cHN9XFxcXHMqXG4gICAgKCN7aW50T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxyLGcsYl0gPSBtYXRjaFxuXG4gIEByZWQgPSBjb250ZXh0LnJlYWRJbnRPclBlcmNlbnQocilcbiAgQGdyZWVuID0gY29udGV4dC5yZWFkSW50T3JQZXJjZW50KGcpXG4gIEBibHVlID0gY29udGV4dC5yZWFkSW50T3JQZXJjZW50KGIpXG4gIEBhbHBoYSA9IDFcblxuIyByZ2JhKDUwLDEyMCwyMDAsMC43KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y3NzX3JnYmEnLCBzdHJpcChcIlxuICAje2luc2Vuc2l0aXZlICdyZ2JhJ30je3BzfVxcXFxzKlxuICAgICgje2ludE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7aW50T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLHIsZyxiLGFdID0gbWF0Y2hcblxuICBAcmVkID0gY29udGV4dC5yZWFkSW50T3JQZXJjZW50KHIpXG4gIEBncmVlbiA9IGNvbnRleHQucmVhZEludE9yUGVyY2VudChnKVxuICBAYmx1ZSA9IGNvbnRleHQucmVhZEludE9yUGVyY2VudChiKVxuICBAYWxwaGEgPSBjb250ZXh0LnJlYWRGbG9hdChhKVxuXG4jIHJnYmEoZ3JlZW4sMC43KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3R5bHVzX3JnYmEnLCBzdHJpcChcIlxuICByZ2JhI3twc31cXFxccypcbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxzdWJleHByLGFdID0gbWF0Y2hcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIEByZ2IgPSBiYXNlQ29sb3IucmdiXG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG5cbiMgaHNsKDIxMCw1MCUsNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y3NzX2hzbCcsIHN0cmlwKFwiXG4gICN7aW5zZW5zaXRpdmUgJ2hzbCd9I3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWydjc3MnLCAnc2FzcycsICdzY3NzJywgJ3N0eWwnLCAnc3R5bHVzJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxzLGxdID0gbWF0Y2hcblxuICBoc2wgPSBbXG4gICAgY29udGV4dC5yZWFkSW50KGgpXG4gICAgY29udGV4dC5yZWFkRmxvYXQocylcbiAgICBjb250ZXh0LnJlYWRGbG9hdChsKVxuICBdXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBoc2wuc29tZSAodikgLT4gbm90IHY/IG9yIGlzTmFOKHYpXG5cbiAgQGhzbCA9IGhzbFxuICBAYWxwaGEgPSAxXG5cbiMgaHNsKDIxMCw1MCUsNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGVzc19oc2wnLCBzdHJpcChcIlxuICBoc2wje3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWydsZXNzJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxzLGxdID0gbWF0Y2hcblxuICBoc2wgPSBbXG4gICAgY29udGV4dC5yZWFkSW50KGgpXG4gICAgY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQocykgKiAxMDBcbiAgICBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChsKSAqIDEwMFxuICBdXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBoc2wuc29tZSAodikgLT4gbm90IHY/IG9yIGlzTmFOKHYpXG5cbiAgQGhzbCA9IGhzbFxuICBAYWxwaGEgPSAxXG5cbiMgaHNsYSgyMTAsNTAlLDUwJSwwLjcpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjc3NfaHNsYScsIHN0cmlwKFwiXG4gICN7aW5zZW5zaXRpdmUgJ2hzbGEnfSN7cHN9XFxcXHMqXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxoLHMsbCxhXSA9IG1hdGNoXG5cbiAgaHNsID0gW1xuICAgIGNvbnRleHQucmVhZEludChoKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHMpXG4gICAgY29udGV4dC5yZWFkRmxvYXQobClcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaHNsLnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoc2wgPSBoc2xcbiAgQGFscGhhID0gY29udGV4dC5yZWFkRmxvYXQoYSlcblxuIyBoc3YoMjEwLDcwJSw5MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpoc3YnLCBzdHJpcChcIlxuICAoPzoje2luc2Vuc2l0aXZlICdoc3YnfXwje2luc2Vuc2l0aXZlICdoc2InfSkje3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxoLHMsdl0gPSBtYXRjaFxuXG4gIGhzdiA9IFtcbiAgICBjb250ZXh0LnJlYWRJbnQoaClcbiAgICBjb250ZXh0LnJlYWRGbG9hdChzKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHYpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhzdi5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaHN2ID0gaHN2XG4gIEBhbHBoYSA9IDFcblxuIyBoc3ZhKDIxMCw3MCUsOTAlLDAuNylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmhzdmEnLCBzdHJpcChcIlxuICAoPzoje2luc2Vuc2l0aXZlICdoc3ZhJ318I3tpbnNlbnNpdGl2ZSAnaHNiYSd9KSN7cHN9XFxcXHMqXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxoLHMsdixhXSA9IG1hdGNoXG5cbiAgaHN2ID0gW1xuICAgIGNvbnRleHQucmVhZEludChoKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHMpXG4gICAgY29udGV4dC5yZWFkRmxvYXQodilcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaHN2LnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoc3YgPSBoc3ZcbiAgQGFscGhhID0gY29udGV4dC5yZWFkRmxvYXQoYSlcblxuIyBoY2coMjEwLDYwJSw1MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpoY2cnLCBzdHJpcChcIlxuICAoPzoje2luc2Vuc2l0aXZlICdoY2cnfSkje3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxoLGMsZ3JdID0gbWF0Y2hcblxuICBoY2cgPSBbXG4gICAgY29udGV4dC5yZWFkSW50KGgpXG4gICAgY29udGV4dC5yZWFkRmxvYXQoYylcbiAgICBjb250ZXh0LnJlYWRGbG9hdChncilcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaGNnLnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoY2cgPSBoY2dcbiAgQGFscGhhID0gMVxuXG4jIGhjZ2EoMjEwLDYwJSw1MCUsMC43KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aGNnYScsIHN0cmlwKFwiXG4gICg/OiN7aW5zZW5zaXRpdmUgJ2hjZ2EnfSkje3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxjLGdyLGFdID0gbWF0Y2hcblxuICBoY2cgPSBbXG4gICAgY29udGV4dC5yZWFkSW50KGgpXG4gICAgY29udGV4dC5yZWFkRmxvYXQoYylcbiAgICBjb250ZXh0LnJlYWRGbG9hdChncilcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaGNnLnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoY2cgPSBoY2dcbiAgQGFscGhhID0gY29udGV4dC5yZWFkRmxvYXQoYSlcblxuIyB2ZWM0KDAuMiwgMC41LCAwLjksIDAuNylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnZlYzQnLCBzdHJpcChcIlxuICB2ZWM0I3twc31cXFxccypcbiAgICAoI3tmbG9hdH0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH0pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLGgscyxsLGFdID0gbWF0Y2hcblxuICBAcmdiYSA9IFtcbiAgICBjb250ZXh0LnJlYWRGbG9hdChoKSAqIDI1NVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHMpICogMjU1XG4gICAgY29udGV4dC5yZWFkRmxvYXQobCkgKiAyNTVcbiAgICBjb250ZXh0LnJlYWRGbG9hdChhKVxuICBdXG5cbiMgaHdiKDIxMCw0MCUsNDAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aHdiJywgc3RyaXAoXCJcbiAgI3tpbnNlbnNpdGl2ZSAnaHdiJ30je3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICg/OiN7Y29tbWF9KCN7ZmxvYXR9fCN7dmFyaWFibGVzfSkpP1xuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxoLHcsYixhXSA9IG1hdGNoXG5cbiAgQGh3YiA9IFtcbiAgICBjb250ZXh0LnJlYWRJbnQoaClcbiAgICBjb250ZXh0LnJlYWRGbG9hdCh3KVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGIpXG4gIF1cbiAgQGFscGhhID0gaWYgYT8gdGhlbiBjb250ZXh0LnJlYWRGbG9hdChhKSBlbHNlIDFcblxuIyBjbXlrKDAsMC41LDEsMClcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNteWsnLCBzdHJpcChcIlxuICAje2luc2Vuc2l0aXZlICdjbXlrJ30je3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLGMsbSx5LGtdID0gbWF0Y2hcblxuICBAY215ayA9IFtcbiAgICBjb250ZXh0LnJlYWRGbG9hdChjKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KG0pXG4gICAgY29udGV4dC5yZWFkRmxvYXQoeSlcbiAgICBjb250ZXh0LnJlYWRGbG9hdChrKVxuICBdXG5cbiMgZ3JheSg1MCUpXG4jIFRoZSBwcmlvcml0eSBpcyBzZXQgdG8gMSB0byBtYWtlIHN1cmUgdGhhdCBpdCBhcHBlYXJzIGJlZm9yZSBuYW1lZCBjb2xvcnNcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmdyYXknLCBzdHJpcChcIlxuICAje2luc2Vuc2l0aXZlICdncmF5J30je3BzfVxcXFxzKlxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICg/OiN7Y29tbWF9KCN7ZmxvYXR9fCN7dmFyaWFibGVzfSkpP1xuICAje3BlfVwiKSwgMSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cblxuICBbXyxwLGFdID0gbWF0Y2hcblxuICBwID0gY29udGV4dC5yZWFkRmxvYXQocCkgLyAxMDAgKiAyNTVcbiAgQHJnYiA9IFtwLCBwLCBwXVxuICBAYWxwaGEgPSBpZiBhPyB0aGVuIGNvbnRleHQucmVhZEZsb2F0KGEpIGVsc2UgMVxuXG4jIGRvZGdlcmJsdWVcbmNvbG9ycyA9IE9iamVjdC5rZXlzKFNWR0NvbG9ycy5hbGxDYXNlcylcbmNvbG9yUmVnZXhwID0gXCIoPzoje25hbWVQcmVmaXhlc30pKCN7Y29sb3JzLmpvaW4oJ3wnKX0pXFxcXGIoPyFbIFxcXFx0XSpbLVxcXFwuOj1cXFxcKF0pXCJcblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bmFtZWRfY29sb3JzJywgY29sb3JSZWdleHAsIFtdLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLG5hbWVdID0gbWF0Y2hcblxuICBAY29sb3JFeHByZXNzaW9uID0gQG5hbWUgPSBuYW1lXG4gIEBoZXggPSBjb250ZXh0LlNWR0NvbG9ycy5hbGxDYXNlc1tuYW1lXS5yZXBsYWNlKCcjJywnJylcblxuIyMgICAgIyMjIyMjIyMgIyMgICAgICMjICMjICAgICMjICAjIyMjIyNcbiMjICAgICMjICAgICAgICMjICAgICAjIyAjIyMgICAjIyAjIyAgICAjI1xuIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjXG4jIyAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMgIyMgIyMgIyNcbiMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAjI1xuIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMjICMjICAgICMjXG4jIyAgICAjIyAgICAgICAgIyMjIyMjIyAgIyMgICAgIyMgICMjIyMjI1xuXG4jIGRhcmtlbigjNjY2NjY2LCAyMCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpkYXJrZW4nLCBzdHJpcChcIlxuICBkYXJrZW4je3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFtoLCBzLCBjb250ZXh0LmNsYW1wSW50KGwgLSBhbW91bnQpXVxuICBAYWxwaGEgPSBiYXNlQ29sb3IuYWxwaGFcblxuIyBsaWdodGVuKCM2NjY2NjYsIDIwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxpZ2h0ZW4nLCBzdHJpcChcIlxuICBsaWdodGVuI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBbaCxzLGxdID0gYmFzZUNvbG9yLmhzbFxuXG4gIEBoc2wgPSBbaCwgcywgY29udGV4dC5jbGFtcEludChsICsgYW1vdW50KV1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgZmFkZSgjZmZmZmZmLCAwLjUpXG4jIGFscGhhKCNmZmZmZmYsIDAuNSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmZhZGUnLCBzdHJpcChcIlxuICAoPzpmYWRlfGFscGhhKSN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBAcmdiID0gYmFzZUNvbG9yLnJnYlxuICBAYWxwaGEgPSBhbW91bnRcblxuIyB0cmFuc3BhcmVudGl6ZSgjZmZmZmZmLCAwLjUpXG4jIHRyYW5zcGFyZW50aXplKCNmZmZmZmYsIDUwJSlcbiMgZmFkZW91dCgjZmZmZmZmLCAwLjUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czp0cmFuc3BhcmVudGl6ZScsIHN0cmlwKFwiXG4gICg/OnRyYW5zcGFyZW50aXplfGZhZGVvdXR8ZmFkZS1vdXR8ZmFkZV9vdXQpI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIEByZ2IgPSBiYXNlQ29sb3IucmdiXG4gIEBhbHBoYSA9IGNvbnRleHQuY2xhbXAoYmFzZUNvbG9yLmFscGhhIC0gYW1vdW50KVxuXG4jIG9wYWNpZnkoMHg3OGZmZmZmZiwgMC41KVxuIyBvcGFjaWZ5KDB4NzhmZmZmZmYsIDUwJSlcbiMgZmFkZWluKDB4NzhmZmZmZmYsIDAuNSlcbiMgYWxwaGEoMHg3OGZmZmZmZiwgMC41KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6b3BhY2lmeScsIHN0cmlwKFwiXG4gICg/Om9wYWNpZnl8ZmFkZWlufGZhZGUtaW58ZmFkZV9pbikje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgQHJnYiA9IGJhc2VDb2xvci5yZ2JcbiAgQGFscGhhID0gY29udGV4dC5jbGFtcChiYXNlQ29sb3IuYWxwaGEgKyBhbW91bnQpXG5cbiMgcmVkKCMwMDAsMjU1KVxuIyBncmVlbigjMDAwLDI1NSlcbiMgYmx1ZSgjMDAwLDI1NSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnN0eWx1c19jb21wb25lbnRfZnVuY3Rpb25zJywgc3RyaXAoXCJcbiAgKHJlZHxncmVlbnxibHVlKSN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBjaGFubmVsLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRJbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGlzTmFOKGFtb3VudClcblxuICBAW2NoYW5uZWxdID0gYW1vdW50XG5cbiMgdHJhbnNwYXJlbnRpZnkoIzgwODA4MClcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnRyYW5zcGFyZW50aWZ5Jywgc3RyaXAoXCJcbiAgdHJhbnNwYXJlbnRpZnkje3BzfVxuICAoI3tub3RRdW90ZX0pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW3RvcCwgYm90dG9tLCBhbHBoYV0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgdG9wID0gY29udGV4dC5yZWFkQ29sb3IodG9wKVxuICBib3R0b20gPSBjb250ZXh0LnJlYWRDb2xvcihib3R0b20pXG4gIGFscGhhID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYWxwaGEpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZCh0b3ApXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgYm90dG9tPyBhbmQgY29udGV4dC5pc0ludmFsaWQoYm90dG9tKVxuXG4gIGJvdHRvbSA/PSBuZXcgY29udGV4dC5Db2xvcigyNTUsMjU1LDI1NSwxKVxuICBhbHBoYSA9IHVuZGVmaW5lZCBpZiBpc05hTihhbHBoYSlcblxuICBiZXN0QWxwaGEgPSBbJ3JlZCcsJ2dyZWVuJywnYmx1ZSddLm1hcCgoY2hhbm5lbCkgLT5cbiAgICByZXMgPSAodG9wW2NoYW5uZWxdIC0gKGJvdHRvbVtjaGFubmVsXSkpIC8gKChpZiAwIDwgdG9wW2NoYW5uZWxdIC0gKGJvdHRvbVtjaGFubmVsXSkgdGhlbiAyNTUgZWxzZSAwKSAtIChib3R0b21bY2hhbm5lbF0pKVxuICAgIHJlc1xuICApLnNvcnQoKGEsIGIpIC0+IGEgPCBiKVswXVxuXG4gIHByb2Nlc3NDaGFubmVsID0gKGNoYW5uZWwpIC0+XG4gICAgaWYgYmVzdEFscGhhIGlzIDBcbiAgICAgIGJvdHRvbVtjaGFubmVsXVxuICAgIGVsc2VcbiAgICAgIGJvdHRvbVtjaGFubmVsXSArICh0b3BbY2hhbm5lbF0gLSAoYm90dG9tW2NoYW5uZWxdKSkgLyBiZXN0QWxwaGFcblxuICBiZXN0QWxwaGEgPSBhbHBoYSBpZiBhbHBoYT9cbiAgYmVzdEFscGhhID0gTWF0aC5tYXgoTWF0aC5taW4oYmVzdEFscGhhLCAxKSwgMClcblxuICBAcmVkID0gcHJvY2Vzc0NoYW5uZWwoJ3JlZCcpXG4gIEBncmVlbiA9IHByb2Nlc3NDaGFubmVsKCdncmVlbicpXG4gIEBibHVlID0gcHJvY2Vzc0NoYW5uZWwoJ2JsdWUnKVxuICBAYWxwaGEgPSBNYXRoLnJvdW5kKGJlc3RBbHBoYSAqIDEwMCkgLyAxMDBcblxuIyBodWUoIzg1NSwgNjBkZWcpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpodWUnLCBzdHJpcChcIlxuICBodWUje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludH1kZWd8I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGlzTmFOKGFtb3VudClcblxuICBbaCxzLGxdID0gYmFzZUNvbG9yLmhzbFxuXG4gIEBoc2wgPSBbYW1vdW50ICUgMzYwLCBzLCBsXVxuICBAYWxwaGEgPSBiYXNlQ29sb3IuYWxwaGFcblxuIyBzYXR1cmF0aW9uKCM4NTUsIDYwZGVnKVxuIyBsaWdodG5lc3MoIzg1NSwgNjBkZWcpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzdHlsdXNfc2xfY29tcG9uZW50X2Z1bmN0aW9ucycsIHN0cmlwKFwiXG4gIChzYXR1cmF0aW9ufGxpZ2h0bmVzcykje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgY2hhbm5lbCwgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkSW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBpc05hTihhbW91bnQpXG5cbiAgYmFzZUNvbG9yW2NoYW5uZWxdID0gYW1vdW50XG4gIEByZ2JhID0gYmFzZUNvbG9yLnJnYmFcblxuIyBhZGp1c3QtaHVlKCM4NTUsIDYwZGVnKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6YWRqdXN0LWh1ZScsIHN0cmlwKFwiXG4gIGFkanVzdC1odWUje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgtPyN7aW50fWRlZ3wje3ZhcmlhYmxlc318LT8je29wdGlvbmFsUGVyY2VudH0pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gWyhoICsgYW1vdW50KSAlIDM2MCwgcywgbF1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgbWl4KCNmMDAsICMwMEYsIDI1JSlcbiMgbWl4KCNmMDAsICMwMEYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czptaXgnLCBcIm1peCN7cHN9KCN7bm90UXVvdGV9KSN7cGV9XCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyLCBhbW91bnRdID0gY29udGV4dC5zcGxpdChleHByKVxuXG4gIGlmIGFtb3VudD9cbiAgICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGVsc2VcbiAgICBhbW91bnQgPSAwLjVcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gY29udGV4dC5taXhDb2xvcnMoYmFzZUNvbG9yMSwgYmFzZUNvbG9yMiwgYW1vdW50KVxuXG4jIHRpbnQocmVkLCA1MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzdHlsdXNfdGludCcsIHN0cmlwKFwiXG4gIHRpbnQje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnc3R5bCcsICdzdHlsdXMnLCAnbGVzcyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgd2hpdGUgPSBuZXcgY29udGV4dC5Db2xvcigyNTUsIDI1NSwgMjU1KVxuXG4gIEByZ2JhID0gY29udGV4dC5taXhDb2xvcnMod2hpdGUsIGJhc2VDb2xvciwgYW1vdW50KS5yZ2JhXG5cbiMgc2hhZGUocmVkLCA1MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzdHlsdXNfc2hhZGUnLCBzdHJpcChcIlxuICBzaGFkZSN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWydzdHlsJywgJ3N0eWx1cycsICdsZXNzJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBibGFjayA9IG5ldyBjb250ZXh0LkNvbG9yKDAsMCwwKVxuXG4gIEByZ2JhID0gY29udGV4dC5taXhDb2xvcnMoYmxhY2ssIGJhc2VDb2xvciwgYW1vdW50KS5yZ2JhXG5cbiMgdGludChyZWQsIDUwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNvbXBhc3NfdGludCcsIHN0cmlwKFwiXG4gIHRpbnQje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnc2Fzczpjb21wYXNzJywgJ3Njc3M6Y29tcGFzcyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgd2hpdGUgPSBuZXcgY29udGV4dC5Db2xvcigyNTUsIDI1NSwgMjU1KVxuXG4gIEByZ2JhID0gY29udGV4dC5taXhDb2xvcnMoYmFzZUNvbG9yLCB3aGl0ZSwgYW1vdW50KS5yZ2JhXG5cbiMgc2hhZGUocmVkLCA1MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjb21wYXNzX3NoYWRlJywgc3RyaXAoXCJcbiAgc2hhZGUje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnc2Fzczpjb21wYXNzJywgJ3Njc3M6Y29tcGFzcyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgYmxhY2sgPSBuZXcgY29udGV4dC5Db2xvcigwLDAsMClcblxuICBAcmdiYSA9IGNvbnRleHQubWl4Q29sb3JzKGJhc2VDb2xvciwgYmxhY2ssIGFtb3VudCkucmdiYVxuXG4jIHRpbnQocmVkLCA1MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpib3VyYm9uX3RpbnQnLCBzdHJpcChcIlxuICB0aW50I3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJ3Nhc3M6Ym91cmJvbicsICdzY3NzOmJvdXJib24nXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIHdoaXRlID0gbmV3IGNvbnRleHQuQ29sb3IoMjU1LCAyNTUsIDI1NSlcblxuICBAcmdiYSA9IGNvbnRleHQubWl4Q29sb3JzKHdoaXRlLCBiYXNlQ29sb3IsIGFtb3VudCkucmdiYVxuXG4jIHNoYWRlKHJlZCwgNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Ym91cmJvbl9zaGFkZScsIHN0cmlwKFwiXG4gIHNoYWRlI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJ3Nhc3M6Ym91cmJvbicsICdzY3NzOmJvdXJib24nXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIGJsYWNrID0gbmV3IGNvbnRleHQuQ29sb3IoMCwwLDApXG5cbiAgQHJnYmEgPSBjb250ZXh0Lm1peENvbG9ycyhibGFjaywgYmFzZUNvbG9yLCBhbW91bnQpLnJnYmFcblxuIyBkZXNhdHVyYXRlKCM4NTUsIDIwJSlcbiMgZGVzYXR1cmF0ZSgjODU1LCAwLjIpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpkZXNhdHVyYXRlJywgXCJkZXNhdHVyYXRlI3twc30oI3tub3RRdW90ZX0pI3tjb21tYX0oI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KSN7cGV9XCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gW2gsIGNvbnRleHQuY2xhbXBJbnQocyAtIGFtb3VudCAqIDEwMCksIGxdXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIHNhdHVyYXRlKCM4NTUsIDIwJSlcbiMgc2F0dXJhdGUoIzg1NSwgMC4yKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c2F0dXJhdGUnLCBzdHJpcChcIlxuICBzYXR1cmF0ZSN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBbaCxzLGxdID0gYmFzZUNvbG9yLmhzbFxuXG4gIEBoc2wgPSBbaCwgY29udGV4dC5jbGFtcEludChzICsgYW1vdW50ICogMTAwKSwgbF1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgZ3JheXNjYWxlKHJlZClcbiMgZ3JleXNjYWxlKHJlZClcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmdyYXlzY2FsZScsIFwiZ3IoPzphfGUpeXNjYWxlI3twc30oI3tub3RRdW90ZX0pI3twZX1cIiwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHJdID0gbWF0Y2hcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFtoLCAwLCBsXVxuICBAYWxwaGEgPSBiYXNlQ29sb3IuYWxwaGFcblxuIyBpbnZlcnQoZ3JlZW4pXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czppbnZlcnQnLCBcImludmVydCN7cHN9KCN7bm90UXVvdGV9KSN7cGV9XCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByXSA9IG1hdGNoXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBbcixnLGJdID0gYmFzZUNvbG9yLnJnYlxuXG4gIEByZ2IgPSBbMjU1IC0gciwgMjU1IC0gZywgMjU1IC0gYl1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgY29tcGxlbWVudChncmVlbilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNvbXBsZW1lbnQnLCBcImNvbXBsZW1lbnQje3BzfSgje25vdFF1b3RlfSkje3BlfVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwcl0gPSBtYXRjaFxuXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gWyhoICsgMTgwKSAlIDM2MCwgcywgbF1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgc3BpbihncmVlbiwgMjApXG4jIHNwaW4oZ3JlZW4sIDIwZGVnKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3BpbicsIHN0cmlwKFwiXG4gIHNwaW4je3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgtPygje2ludH0pKGRlZyk/fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFuZ2xlXSA9IG1hdGNoXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcbiAgYW5nbGUgPSBjb250ZXh0LnJlYWRJbnQoYW5nbGUpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gWygzNjAgKyBoICsgYW5nbGUpICUgMzYwLCBzLCBsXVxuICBAYWxwaGEgPSBiYXNlQ29sb3IuYWxwaGFcblxuIyBjb250cmFzdCgjNjY2NjY2LCAjMTExMTExLCAjOTk5OTk5LCB0aHJlc2hvbGQpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjb250cmFzdF9uX2FyZ3VtZW50cycsIHN0cmlwKFwiXG4gIGNvbnRyYXN0I3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtiYXNlLCBkYXJrLCBsaWdodCwgdGhyZXNob2xkXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihiYXNlKVxuICBkYXJrID0gY29udGV4dC5yZWFkQ29sb3IoZGFyaylcbiAgbGlnaHQgPSBjb250ZXh0LnJlYWRDb2xvcihsaWdodClcbiAgdGhyZXNob2xkID0gY29udGV4dC5yZWFkUGVyY2VudCh0aHJlc2hvbGQpIGlmIHRocmVzaG9sZD9cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBkYXJrPy5pbnZhbGlkXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgbGlnaHQ/LmludmFsaWRcblxuICByZXMgPSBjb250ZXh0LmNvbnRyYXN0KGJhc2VDb2xvciwgZGFyaywgbGlnaHQpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChyZXMpXG5cbiAge0ByZ2J9ID0gY29udGV4dC5jb250cmFzdChiYXNlQ29sb3IsIGRhcmssIGxpZ2h0LCB0aHJlc2hvbGQpXG5cbiMgY29udHJhc3QoIzY2NjY2NilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNvbnRyYXN0XzFfYXJndW1lbnQnLCBzdHJpcChcIlxuICBjb250cmFzdCN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwcl0gPSBtYXRjaFxuXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAge0ByZ2J9ID0gY29udGV4dC5jb250cmFzdChiYXNlQ29sb3IpXG5cbiMgY29sb3IoZ3JlZW4gdGludCg1MCUpKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y3NzX2NvbG9yX2Z1bmN0aW9uJywgXCIoPzoje25hbWVQcmVmaXhlc30pKCN7aW5zZW5zaXRpdmUgJ2NvbG9yJ30je3BzfSgje25vdFF1b3RlfSkje3BlfSlcIiwgWydjc3MnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICB0cnlcbiAgICBbXyxleHByXSA9IG1hdGNoXG4gICAgZm9yIGssdiBvZiBjb250ZXh0LnZhcnNcbiAgICAgIGV4cHIgPSBleHByLnJlcGxhY2UoLy8vXG4gICAgICAgICN7ay5yZXBsYWNlKC9cXCgvZywgJ1xcXFwoJykucmVwbGFjZSgvXFwpL2csICdcXFxcKScpfVxuICAgICAgLy8vZywgdi52YWx1ZSlcblxuICAgIGNzc0NvbG9yID0gcmVxdWlyZSAnY3NzLWNvbG9yLWZ1bmN0aW9uJ1xuICAgIHJnYmEgPSBjc3NDb2xvci5jb252ZXJ0KGV4cHIudG9Mb3dlckNhc2UoKSlcbiAgICBAcmdiYSA9IGNvbnRleHQucmVhZENvbG9yKHJnYmEpLnJnYmFcbiAgICBAY29sb3JFeHByZXNzaW9uID0gZXhwclxuICBjYXRjaCBlXG4gICAgQGludmFsaWQgPSB0cnVlXG5cbiMgYWRqdXN0LWNvbG9yKHJlZCwgJGxpZ2h0bmVzczogMzAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c2Fzc19hZGp1c3RfY29sb3InLCBcImFkanVzdC1jb2xvciN7cHN9KCN7bm90UXVvdGV9KSN7cGV9XCIsIDEsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByXSA9IG1hdGNoXG4gIHJlcyA9IGNvbnRleHQuc3BsaXQoc3ViZXhwcilcbiAgc3ViamVjdCA9IHJlc1swXVxuICBwYXJhbXMgPSByZXMuc2xpY2UoMSlcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJqZWN0KVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIGZvciBwYXJhbSBpbiBwYXJhbXNcbiAgICBjb250ZXh0LnJlYWRQYXJhbSBwYXJhbSwgKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgYmFzZUNvbG9yW25hbWVdICs9IGNvbnRleHQucmVhZEZsb2F0KHZhbHVlKVxuXG4gIEByZ2JhID0gYmFzZUNvbG9yLnJnYmFcblxuIyBzY2FsZS1jb2xvcihyZWQsICRsaWdodG5lc3M6IDMwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNhc3Nfc2NhbGVfY29sb3InLCBcInNjYWxlLWNvbG9yI3twc30oI3tub3RRdW90ZX0pI3twZX1cIiwgMSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgTUFYX1BFUl9DT01QT05FTlQgPVxuICAgIHJlZDogMjU1XG4gICAgZ3JlZW46IDI1NVxuICAgIGJsdWU6IDI1NVxuICAgIGFscGhhOiAxXG4gICAgaHVlOiAzNjBcbiAgICBzYXR1cmF0aW9uOiAxMDBcbiAgICBsaWdodG5lc3M6IDEwMFxuXG4gIFtfLCBzdWJleHByXSA9IG1hdGNoXG4gIHJlcyA9IGNvbnRleHQuc3BsaXQoc3ViZXhwcilcbiAgc3ViamVjdCA9IHJlc1swXVxuICBwYXJhbXMgPSByZXMuc2xpY2UoMSlcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJqZWN0KVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIGZvciBwYXJhbSBpbiBwYXJhbXNcbiAgICBjb250ZXh0LnJlYWRQYXJhbSBwYXJhbSwgKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgdmFsdWUgPSBjb250ZXh0LnJlYWRGbG9hdCh2YWx1ZSkgLyAxMDBcblxuICAgICAgcmVzdWx0ID0gaWYgdmFsdWUgPiAwXG4gICAgICAgIGRpZiA9IE1BWF9QRVJfQ09NUE9ORU5UW25hbWVdIC0gYmFzZUNvbG9yW25hbWVdXG4gICAgICAgIHJlc3VsdCA9IGJhc2VDb2xvcltuYW1lXSArIGRpZiAqIHZhbHVlXG4gICAgICBlbHNlXG4gICAgICAgIHJlc3VsdCA9IGJhc2VDb2xvcltuYW1lXSAqICgxICsgdmFsdWUpXG5cbiAgICAgIGJhc2VDb2xvcltuYW1lXSA9IHJlc3VsdFxuXG4gIEByZ2JhID0gYmFzZUNvbG9yLnJnYmFcblxuIyBjaGFuZ2UtY29sb3IocmVkLCAkbGlnaHRuZXNzOiAzMCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzYXNzX2NoYW5nZV9jb2xvcicsIFwiY2hhbmdlLWNvbG9yI3twc30oI3tub3RRdW90ZX0pI3twZX1cIiwgMSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHJdID0gbWF0Y2hcbiAgcmVzID0gY29udGV4dC5zcGxpdChzdWJleHByKVxuICBzdWJqZWN0ID0gcmVzWzBdXG4gIHBhcmFtcyA9IHJlcy5zbGljZSgxKVxuXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmplY3QpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgZm9yIHBhcmFtIGluIHBhcmFtc1xuICAgIGNvbnRleHQucmVhZFBhcmFtIHBhcmFtLCAobmFtZSwgdmFsdWUpIC0+XG4gICAgICBiYXNlQ29sb3JbbmFtZV0gPSBjb250ZXh0LnJlYWRGbG9hdCh2YWx1ZSlcblxuICBAcmdiYSA9IGJhc2VDb2xvci5yZ2JhXG5cbiMgYmxlbmQocmdiYSgjRkZERTAwLC40MiksIDB4MTlDMjYxKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3R5bHVzX2JsZW5kJywgc3RyaXAoXCJcbiAgYmxlbmQje3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICBAcmdiYSA9IFtcbiAgICBiYXNlQ29sb3IxLnJlZCAqIGJhc2VDb2xvcjEuYWxwaGEgKyBiYXNlQ29sb3IyLnJlZCAqICgxIC0gYmFzZUNvbG9yMS5hbHBoYSlcbiAgICBiYXNlQ29sb3IxLmdyZWVuICogYmFzZUNvbG9yMS5hbHBoYSArIGJhc2VDb2xvcjIuZ3JlZW4gKiAoMSAtIGJhc2VDb2xvcjEuYWxwaGEpXG4gICAgYmFzZUNvbG9yMS5ibHVlICogYmFzZUNvbG9yMS5hbHBoYSArIGJhc2VDb2xvcjIuYmx1ZSAqICgxIC0gYmFzZUNvbG9yMS5hbHBoYSlcbiAgICBiYXNlQ29sb3IxLmFscGhhICsgYmFzZUNvbG9yMi5hbHBoYSAtIGJhc2VDb2xvcjEuYWxwaGEgKiBiYXNlQ29sb3IyLmFscGhhXG4gIF1cblxuIyBDb2xvcig1MCwxMjAsMjAwLDI1NSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmx1YV9yZ2JhJywgc3RyaXAoXCJcbiAgKD86I3tuYW1lUHJlZml4ZXN9KUNvbG9yI3twc31cXFxccypcbiAgICAoI3tpbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWydsdWEnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxyLGcsYixhXSA9IG1hdGNoXG5cbiAgQHJlZCA9IGNvbnRleHQucmVhZEludChyKVxuICBAZ3JlZW4gPSBjb250ZXh0LnJlYWRJbnQoZylcbiAgQGJsdWUgPSBjb250ZXh0LnJlYWRJbnQoYilcbiAgQGFscGhhID0gY29udGV4dC5yZWFkSW50KGEpIC8gMjU1XG5cbiMjICAgICMjIyMjIyMjICAjIyAgICAgICAjIyMjIyMjIyAjIyAgICAjIyAjIyMjIyMjI1xuIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICMjIyAgICMjICMjICAgICAjI1xuIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICMjIyMgICMjICMjICAgICAjI1xuIyMgICAgIyMjIyMjIyMgICMjICAgICAgICMjIyMjIyAgICMjICMjICMjICMjICAgICAjI1xuIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICMjICAjIyMjICMjICAgICAjI1xuIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgIyMjICMjICAgICAjI1xuIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjXG5cbiMgbXVsdGlwbHkoI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOm11bHRpcGx5Jywgc3RyaXAoXCJcbiAgbXVsdGlwbHkje3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuTVVMVElQTFkpXG5cbiMgc2NyZWVuKCNmMDAsICMwMEYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzY3JlZW4nLCBzdHJpcChcIlxuICBzY3JlZW4je3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuU0NSRUVOKVxuXG5cbiMgb3ZlcmxheSgjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6b3ZlcmxheScsIHN0cmlwKFwiXG4gIG92ZXJsYXkje3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuT1ZFUkxBWSlcblxuXG4jIHNvZnRsaWdodCgjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c29mdGxpZ2h0Jywgc3RyaXAoXCJcbiAgc29mdGxpZ2h0I3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGJhc2VDb2xvcjEuYmxlbmQoYmFzZUNvbG9yMiwgY29udGV4dC5CbGVuZE1vZGVzLlNPRlRfTElHSFQpXG5cblxuIyBoYXJkbGlnaHQoI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmhhcmRsaWdodCcsIHN0cmlwKFwiXG4gIGhhcmRsaWdodCN7cHN9XG4gICAgKFxuICAgICAgI3tub3RRdW90ZX1cbiAgICAgICN7Y29tbWF9XG4gICAgICAje25vdFF1b3RlfVxuICAgIClcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGV4cHJdID0gbWF0Y2hcblxuICBbY29sb3IxLCBjb2xvcjJdID0gY29udGV4dC5zcGxpdChleHByKVxuXG4gIGJhc2VDb2xvcjEgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjEpXG4gIGJhc2VDb2xvcjIgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IxKSBvciBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IyKVxuXG4gIHtAcmdiYX0gPSBiYXNlQ29sb3IxLmJsZW5kKGJhc2VDb2xvcjIsIGNvbnRleHQuQmxlbmRNb2Rlcy5IQVJEX0xJR0hUKVxuXG5cbiMgZGlmZmVyZW5jZSgjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZGlmZmVyZW5jZScsIHN0cmlwKFwiXG4gIGRpZmZlcmVuY2Uje3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuRElGRkVSRU5DRSlcblxuIyBleGNsdXNpb24oI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmV4Y2x1c2lvbicsIHN0cmlwKFwiXG4gIGV4Y2x1c2lvbiN7cHN9XG4gICAgKFxuICAgICAgI3tub3RRdW90ZX1cbiAgICAgICN7Y29tbWF9XG4gICAgICAje25vdFF1b3RlfVxuICAgIClcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGV4cHJdID0gbWF0Y2hcblxuICBbY29sb3IxLCBjb2xvcjJdID0gY29udGV4dC5zcGxpdChleHByKVxuXG4gIGJhc2VDb2xvcjEgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjEpXG4gIGJhc2VDb2xvcjIgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IxKSBvciBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IyKVxuXG4gIHtAcmdiYX0gPSBiYXNlQ29sb3IxLmJsZW5kKGJhc2VDb2xvcjIsIGNvbnRleHQuQmxlbmRNb2Rlcy5FWENMVVNJT04pXG5cbiMgYXZlcmFnZSgjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6YXZlcmFnZScsIHN0cmlwKFwiXG4gIGF2ZXJhZ2Uje3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG4gICAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZVxuXG4gIHtAcmdiYX0gPSBiYXNlQ29sb3IxLmJsZW5kKGJhc2VDb2xvcjIsIGNvbnRleHQuQmxlbmRNb2Rlcy5BVkVSQUdFKVxuXG4jIG5lZ2F0aW9uKCNmMDAsICMwMEYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpuZWdhdGlvbicsIHN0cmlwKFwiXG4gIG5lZ2F0aW9uI3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGJhc2VDb2xvcjEuYmxlbmQoYmFzZUNvbG9yMiwgY29udGV4dC5CbGVuZE1vZGVzLk5FR0FUSU9OKVxuXG4jIyAgICAjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyNcbiMjICAgICMjICAgICAgICMjICAgICAgICMjIyAgICMjI1xuIyMgICAgIyMgICAgICAgIyMgICAgICAgIyMjIyAjIyMjXG4jIyAgICAjIyMjIyMgICAjIyAgICAgICAjIyAjIyMgIyNcbiMjICAgICMjICAgICAgICMjICAgICAgICMjICAgICAjI1xuIyMgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjXG4jIyAgICAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAgIyNcblxuIyByZ2JhIDUwIDEyMCAyMDAgMVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZWxtX3JnYmEnLCBzdHJpcChcIlxuICByZ2JhXFxcXHMrXG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICAgXFxcXHMrXG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICAgXFxcXHMrXG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICAgXFxcXHMrXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcblwiKSwgWydlbG0nXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxyLGcsYixhXSA9IG1hdGNoXG5cbiAgQHJlZCA9IGNvbnRleHQucmVhZEludChyKVxuICBAZ3JlZW4gPSBjb250ZXh0LnJlYWRJbnQoZylcbiAgQGJsdWUgPSBjb250ZXh0LnJlYWRJbnQoYilcbiAgQGFscGhhID0gY29udGV4dC5yZWFkRmxvYXQoYSlcblxuIyByZ2IgNTAgMTIwIDIwMFxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZWxtX3JnYicsIHN0cmlwKFwiXG4gIHJnYlxcXFxzK1xuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuXCIpLCBbJ2VsbSddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLHIsZyxiXSA9IG1hdGNoXG5cbiAgQHJlZCA9IGNvbnRleHQucmVhZEludChyKVxuICBAZ3JlZW4gPSBjb250ZXh0LnJlYWRJbnQoZylcbiAgQGJsdWUgPSBjb250ZXh0LnJlYWRJbnQoYilcblxuZWxtQW5nbGUgPSBcIig/OiN7ZmxvYXR9fFxcXFwoZGVncmVlc1xcXFxzKyg/OiN7aW50fXwje3ZhcmlhYmxlc30pXFxcXCkpXCJcblxuIyBoc2wgMjEwIDUwIDUwXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czplbG1faHNsJywgc3RyaXAoXCJcbiAgaHNsXFxcXHMrXG4gICAgKCN7ZWxtQW5nbGV9fCN7dmFyaWFibGVzfSlcbiAgICBcXFxccytcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG5cIiksIFsnZWxtJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgZWxtRGVncmVlc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcKGRlZ3JlZXNcXFxccysoI3tjb250ZXh0LmludH18I3tjb250ZXh0LnZhcmlhYmxlc1JFfSlcXFxcKVwiKVxuXG4gIFtfLGgscyxsXSA9IG1hdGNoXG5cbiAgaWYgbSA9IGVsbURlZ3JlZXNSZWdleHAuZXhlYyhoKVxuICAgIGggPSBjb250ZXh0LnJlYWRJbnQobVsxXSlcbiAgZWxzZVxuICAgIGggPSBjb250ZXh0LnJlYWRGbG9hdChoKSAqIDE4MCAvIE1hdGguUElcblxuICBoc2wgPSBbXG4gICAgaFxuICAgIGNvbnRleHQucmVhZEZsb2F0KHMpXG4gICAgY29udGV4dC5yZWFkRmxvYXQobClcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaHNsLnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoc2wgPSBoc2xcbiAgQGFscGhhID0gMVxuXG4jIGhzbGEgMjEwIDUwIDUwIDAuN1xucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZWxtX2hzbGEnLCBzdHJpcChcIlxuICBoc2xhXFxcXHMrXG4gICAgKCN7ZWxtQW5nbGV9fCN7dmFyaWFibGVzfSlcbiAgICBcXFxccytcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgXFxcXHMrXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcblwiKSwgWydlbG0nXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBlbG1EZWdyZWVzUmVnZXhwID0gbmV3IFJlZ0V4cChcIlxcXFwoZGVncmVlc1xcXFxzKygje2NvbnRleHQuaW50fXwje2NvbnRleHQudmFyaWFibGVzUkV9KVxcXFwpXCIpXG5cbiAgW18saCxzLGwsYV0gPSBtYXRjaFxuXG4gIGlmIG0gPSBlbG1EZWdyZWVzUmVnZXhwLmV4ZWMoaClcbiAgICBoID0gY29udGV4dC5yZWFkSW50KG1bMV0pXG4gIGVsc2VcbiAgICBoID0gY29udGV4dC5yZWFkRmxvYXQoaCkgKiAxODAgLyBNYXRoLlBJXG5cbiAgaHNsID0gW1xuICAgIGhcbiAgICBjb250ZXh0LnJlYWRGbG9hdChzKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGwpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhzbC5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaHNsID0gaHNsXG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG5cbiMgZ3JheXNjYWxlIDFcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmVsbV9ncmF5c2NhbGUnLCBcImdyKD86YXxlKXlzY2FsZVxcXFxzKygje2Zsb2F0fXwje3ZhcmlhYmxlc30pXCIsIFsnZWxtJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sYW1vdW50XSA9IG1hdGNoXG4gIGFtb3VudCA9IE1hdGguZmxvb3IoMjU1IC0gY29udGV4dC5yZWFkRmxvYXQoYW1vdW50KSAqIDI1NSlcbiAgQHJnYiA9IFthbW91bnQsIGFtb3VudCwgYW1vdW50XVxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czplbG1fY29tcGxlbWVudCcsIHN0cmlwKFwiXG4gIGNvbXBsZW1lbnRcXFxccysoI3tub3RRdW90ZX0pXG5cIiksIFsnZWxtJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHJdID0gbWF0Y2hcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFsoaCArIDE4MCkgJSAzNjAsIHMsIGxdXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIyAgICAjIyAgICAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgICMjXG4jIyAgICAjIyAgICAgICAgICMjICMjICAgICAgIyMgICAgIyMgICAgICAgICMjICAgIyNcbiMjICAgICMjICAgICAgICAjIyAgICMjICAgICAjIyAgICAjIyAgICAgICAgICMjICMjXG4jIyAgICAjIyAgICAgICAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjICAgICAgIyMjXG4jIyAgICAjIyAgICAgICAjIyMjIyMjIyMgICAgIyMgICAgIyMgICAgICAgICAjIyAjI1xuIyMgICAgIyMgICAgICAgIyMgICAgICMjICAgICMjICAgICMjICAgICAgICAjIyAgICMjXG4jIyAgICAjIyMjIyMjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgICMjXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxhdGV4X2dyYXknLCBzdHJpcChcIlxuICBcXFxcW2dyYXlcXFxcXVxcXFx7KCN7ZmxvYXR9KVxcXFx9XG5cIiksIFsndGV4J10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0KGFtb3VudCkgKiAyNTVcbiAgQHJnYiA9IFthbW91bnQsIGFtb3VudCwgYW1vdW50XVxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsYXRleF9odG1sJywgc3RyaXAoXCJcbiAgXFxcXFtIVE1MXFxcXF1cXFxceygje2hleGFkZWNpbWFsfXs2fSlcXFxcfVxuXCIpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG5cbiAgQGhleCA9IGhleGFcblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXhfcmdiJywgc3RyaXAoXCJcbiAgXFxcXFtyZ2JcXFxcXVxcXFx7KCN7ZmxvYXR9KSN7Y29tbWF9KCN7ZmxvYXR9KSN7Y29tbWF9KCN7ZmxvYXR9KVxcXFx9XG5cIiksIFsndGV4J10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHIsZyxiXSA9IG1hdGNoXG5cbiAgciA9IE1hdGguZmxvb3IoY29udGV4dC5yZWFkRmxvYXQocikgKiAyNTUpXG4gIGcgPSBNYXRoLmZsb29yKGNvbnRleHQucmVhZEZsb2F0KGcpICogMjU1KVxuICBiID0gTWF0aC5mbG9vcihjb250ZXh0LnJlYWRGbG9hdChiKSAqIDI1NSlcbiAgQHJnYiA9IFtyLCBnLCBiXVxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsYXRleF9SR0InLCBzdHJpcChcIlxuICBcXFxcW1JHQlxcXFxdXFxcXHsoI3tpbnR9KSN7Y29tbWF9KCN7aW50fSkje2NvbW1hfSgje2ludH0pXFxcXH1cblwiKSwgWyd0ZXgnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgcixnLGJdID0gbWF0Y2hcblxuICByID0gY29udGV4dC5yZWFkSW50KHIpXG4gIGcgPSBjb250ZXh0LnJlYWRJbnQoZylcbiAgYiA9IGNvbnRleHQucmVhZEludChiKVxuICBAcmdiID0gW3IsIGcsIGJdXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxhdGV4X2NteWsnLCBzdHJpcChcIlxuICBcXFxcW2NteWtcXFxcXVxcXFx7KCN7ZmxvYXR9KSN7Y29tbWF9KCN7ZmxvYXR9KSN7Y29tbWF9KCN7ZmxvYXR9KSN7Y29tbWF9KCN7ZmxvYXR9KVxcXFx9XG5cIiksIFsndGV4J10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGMsbSx5LGtdID0gbWF0Y2hcblxuICBjID0gY29udGV4dC5yZWFkRmxvYXQoYylcbiAgbSA9IGNvbnRleHQucmVhZEZsb2F0KG0pXG4gIHkgPSBjb250ZXh0LnJlYWRGbG9hdCh5KVxuICBrID0gY29udGV4dC5yZWFkRmxvYXQoaylcbiAgQGNteWsgPSBbYyxtLHksa11cblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXhfcHJlZGVmaW5lZCcsIHN0cmlwKCdcbiAgXFxcXHsoYmxhY2t8Ymx1ZXxicm93bnxjeWFufGRhcmtncmF5fGdyYXl8Z3JlZW58bGlnaHRncmF5fGxpbWV8bWFnZW50YXxvbGl2ZXxvcmFuZ2V8cGlua3xwdXJwbGV8cmVkfHRlYWx8dmlvbGV0fHdoaXRlfHllbGxvdylcXFxcfVxuJyksIFsndGV4J10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIG5hbWVdID0gbWF0Y2hcbiAgQGhleCA9IGNvbnRleHQuU1ZHQ29sb3JzLmFsbENhc2VzW25hbWVdLnJlcGxhY2UoJyMnLCcnKVxuXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxhdGV4X3ByZWRlZmluZWRfZHZpcG5hbWVzJywgc3RyaXAoJ1xuICBcXFxceyhBcHJpY290fEFxdWFtYXJpbmV8Qml0dGVyc3dlZXR8QmxhY2t8Qmx1ZXxCbHVlR3JlZW58Qmx1ZVZpb2xldHxCcmlja1JlZHxCcm93bnxCdXJudE9yYW5nZXxDYWRldEJsdWV8Q2FybmF0aW9uUGlua3xDZXJ1bGVhbnxDb3JuZmxvd2VyQmx1ZXxDeWFufERhbmRlbGlvbnxEYXJrT3JjaGlkfEVtZXJhbGR8Rm9yZXN0R3JlZW58RnVjaHNpYXxHb2xkZW5yb2R8R3JheXxHcmVlbnxHcmVlblllbGxvd3xKdW5nbGVHcmVlbnxMYXZlbmRlcnxMaW1lR3JlZW58TWFnZW50YXxNYWhvZ2FueXxNYXJvb258TWVsb258TWlkbmlnaHRCbHVlfE11bGJlcnJ5fE5hdnlCbHVlfE9saXZlR3JlZW58T3JhbmdlfE9yYW5nZVJlZHxPcmNoaWR8UGVhY2h8UGVyaXdpbmtsZXxQaW5lR3JlZW58UGx1bXxQcm9jZXNzQmx1ZXxQdXJwbGV8UmF3U2llbm5hfFJlZHxSZWRPcmFuZ2V8UmVkVmlvbGV0fFJob2RhbWluZXxSb3lhbEJsdWV8Um95YWxQdXJwbGV8UnViaW5lUmVkfFNhbG1vbnxTZWFHcmVlbnxTZXBpYXxTa3lCbHVlfFNwcmluZ0dyZWVufFRhbnxUZWFsQmx1ZXxUaGlzdGxlfFR1cnF1b2lzZXxWaW9sZXR8VmlvbGV0UmVkfFdoaXRlfFdpbGRTdHJhd2JlcnJ5fFllbGxvd3xZZWxsb3dHcmVlbnxZZWxsb3dPcmFuZ2UpXFxcXH1cbicpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBuYW1lXSA9IG1hdGNoXG4gIEBoZXggPSBjb250ZXh0LkRWSVBuYW1lc1tuYW1lXS5yZXBsYWNlKCcjJywnJylcblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXhfbWl4Jywgc3RyaXAoJ1xuICBcXFxceyhbXiFcXFxcblxcXFx9XStbIV1bXlxcXFx9XFxcXG5dKylcXFxcfVxuJyksIFsndGV4J10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGV4cHJdID0gbWF0Y2hcblxuICBvcCA9IGV4cHIuc3BsaXQoJyEnKVxuXG4gIG1peCA9IChbYSxwLGJdKSAtPlxuICAgIGNvbG9yQSA9IGlmIGEgaW5zdGFuY2VvZiBjb250ZXh0LkNvbG9yIHRoZW4gYSBlbHNlIGNvbnRleHQucmVhZENvbG9yKFwieyN7YX19XCIpXG4gICAgY29sb3JCID0gaWYgYiBpbnN0YW5jZW9mIGNvbnRleHQuQ29sb3IgdGhlbiBiIGVsc2UgY29udGV4dC5yZWFkQ29sb3IoXCJ7I3tifX1cIilcbiAgICBwZXJjZW50ID0gY29udGV4dC5yZWFkSW50KHApXG5cbiAgICBjb250ZXh0Lm1peENvbG9ycyhjb2xvckEsIGNvbG9yQiwgcGVyY2VudCAvIDEwMClcblxuICBvcC5wdXNoKG5ldyBjb250ZXh0LkNvbG9yKDI1NSwgMjU1LCAyNTUpKSBpZiBvcC5sZW5ndGggaXMgMlxuXG4gIG5leHRDb2xvciA9IG51bGxcblxuICB3aGlsZSBvcC5sZW5ndGggPiAwXG4gICAgdHJpcGxldCA9IG9wLnNwbGljZSgwLDMpXG4gICAgbmV4dENvbG9yID0gbWl4KHRyaXBsZXQpXG4gICAgb3AudW5zaGlmdChuZXh0Q29sb3IpIGlmIG9wLmxlbmd0aCA+IDBcblxuICBAcmdiID0gbmV4dENvbG9yLnJnYlxuXG4jICAgICAjIyMjIyMjICAjIyMjIyMjI1xuIyAgICAjIyAgICAgIyMgICAgIyNcbiMgICAgIyMgICAgICMjICAgICMjXG4jICAgICMjICAgICAjIyAgICAjI1xuIyAgICAjIyAgIyMgIyMgICAgIyNcbiMgICAgIyMgICAgIyMgICAgICMjXG4jICAgICAjIyMjIyAjIyAgICAjI1xuXG4jIFF0LnJnYmEoMS4wLDAuNSwwLjAsMC43KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6cXRfcmdiYScsIHN0cmlwKFwiXG4gIFF0XFxcXC5yZ2JhI3twc31cXFxccypcbiAgICAoI3tmbG9hdH0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH0pXG4gICN7cGV9XG5cIiksIFsncW1sJywgJ2MnLCAnY2MnLCAnY3BwJ10sIDEsIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18scixnLGIsYV0gPSBtYXRjaFxuXG4gIEByZWQgPSBjb250ZXh0LnJlYWRGbG9hdChyKSAqIDI1NVxuICBAZ3JlZW4gPSBjb250ZXh0LnJlYWRGbG9hdChnKSAqIDI1NVxuICBAYmx1ZSA9IGNvbnRleHQucmVhZEZsb2F0KGIpICogMjU1XG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG4iXX0=
