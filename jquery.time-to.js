/**
 * Time-To jQuery plug-in
 * Show countdown timer or realtime clock
 *
 * @author Alexey Teterin <altmoc@gmail.com>
 * @version 1.1.2
 * @license MIT http://opensource.org/licenses/MIT
 * @date 2015-11-26
 */
'use strict';

(function(factory) {
    if(typeof exports === 'object') {
        // CommonJS (Node)
        var jQuery = require('jquery');
        module.exports = factory(jQuery || $);
    } else if(typeof define === 'function' && define.amd) {
        // AMD (RequireJS)
        define(['jquery'], factory);
    } else {
        // globals
        factory(jQuery || $);
    }
}(function($) {

    var SECONDS_PER_DAY = 86400,
        SECONDS_PER_HOUR = 3600;

    var defaults = {
        callback: null,          // callback function for exec when timer out
        captionSize: 0,          // font-size by pixels for captions, if 0 then calculate automaticaly
        countdown: true,         // is countdown or real clock
        countdownAlertLimit: 10, // limit in seconds when display red background
        displayCaptions: false,  // display captions under digit groups
        displayDays: 0,          // display day timer, count of days digits
        displayHours: true,      // display hours
        fontFamily: 'Verdana, sans-serif',
        fontSize: 0,             // font-size of a digit by pixels (0 - use CSS instead)
        lang: 'en',              // language of caption
        seconds: 0,              // timer's countdown value in seconds
        start: true,             // true to start timer immediately
        theme: 'white',          // 'white' or 'black' theme fo timer's view
        
        width: 25,          // width of a digit area
        height: 30,         // height of a digit area
        gap: 11,            // gap size between numbers
        vals: [0, 0, 0, 0, 0, 0, 0, 0, 0],  // private, current value of each digit
        limits: [9, 9, 9, 2, 9, 5, 9, 5, 9],// private, max value of each digit
        iSec: 8,            // private, index of second digit
        iHour: 4,           // private, index of hour digit
        tickTimeout: 1000,  // timeout betweet each timer tick in miliseconds
        intervalId: null    // private
    };

    var methods = {
        start: function(sec) {
            var me = this,
                intervalId;

            if(sec) {
                init.call(this, sec);
                intervalId = setTimeout(function() { tick.call(me); }, 1000);

                // save start time
                this.data('ttStartTime', $.now());
                this.data('intervalId', intervalId);
            }
        },

        stop: function() {
            var data = this.data();

            if(data.intervalId) {
                clearTimeout(data.intervalId);
                this.data('intervalId', null);
            }
            return data;
        },
        
        reset: function(sec) {
            var data = methods.stop.call(this);

            this.find('div').css({ backgroundPosition: 'left center' });
            this.find('ul').parent().removeClass('timeTo-alert');

            if(typeof sec === 'undefined') {
                sec = data.seconds;
            }
            init.call(this, sec, true);
        }
    };

    var dictionary = {
        en:{days:'days',   hours:'hours',  min:'minutes',  sec:'seconds'},
        ru:{days:'дней',   hours:'часов',  min:'минут',    sec:'секунд'},
        ua:{days:'днiв',   hours:'годин',  min:'хвилин',   sec:'секунд'},
        de:{days:'Tag',    hours:'Uhr',    min:'Minuten',  sec:'Secunden'},
        fr:{days:'jours',  hours:'heures', min:'minutes',  sec:'secondes'},
        sp:{days:'días',   hours:'horas',  min:'minutos',  sec:'segundos'},
        it:{days:'giorni', hours:'ore',    min:'minuti',   sec:'secondi'},
        nl:{days:'dagen',  hours:'uren',   min:'minuten',  sec:'seconden'},
        no:{days:'dager',  hours:'timer',  min:'minutter', sec:'sekunder'},
        pt:{days:'dias',   hours:'horas',  min:'minutos',  sec:'segundos'},
        tr:{days:'gün',    hours:'saat',   min:'dakika',   sec:'saniye'}
    };
    
    if(typeof $.support.transition === 'undefined') {
        $.support.transition = (function() {
            var thisBody = document.body || document.documentElement,
                thisStyle = thisBody.style,
                support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;

            return support;
        })();
    }


    $.fn.timeTo = function() {
        var method, options = {};
        var i, arg, num;
        var time, days, now = $.now();
        var tt, sec, m, t;

        for(i = 0; arg = arguments[i]; ++i) {
            if(i == 0 && typeof arg === 'string') {
                method = arg;
            }
            else {
                if(typeof arg === 'object') {
                    // arg is a Date object
                    if(typeof arg.getTime === 'function') {
                        options.timeTo = arg;
                    }
                    else { // arg is an options object
                        options = $.extend(options, arg);
                    }
                }
                else {
                    // arg is callback
                    if(typeof arg === 'function') {
                        options.callback = arg;
                    }
                    else {
                        num = parseInt(arg, 10);
                        // arg is seconds of timeout
                        if(!isNaN(num)) {
                            options.seconds = num;
                        }
                    }
                }
            }
        }

        // set time to countdown to
        if(options.timeTo) {
            if(options.timeTo.getTime) { // set time as date object
                time = options.timeTo.getTime();
            }
            else if(typeof options.timeTo === 'number') {  // set time as integer in millisec
                time = options.timeTo;
            }
            if(time > now) {
                options.seconds = Math.floor((time - now) / 1000);
            }
            else {
                options.seconds = 0;
            }
        } else if(options.time || !options.seconds) {
            time = options.time;

            if(!time) {
                time = new Date();
            }

            if(typeof time === 'object' && time.getTime) {
                options.seconds = time.getHours()*SECONDS_PER_HOUR + time.getMinutes()*60 + time.getSeconds();
                options.countdown = false;
            }
            else if(typeof time === 'string') {
                tt = time.split(':');
                sec = 0;
                m = 1;

                while(t = tt.pop()) {
                    sec += t * m;
                    m *= 60;
                }
                options.seconds = sec;
                options.countdown = false;
            }
        }

        if(options.countdown !== false && options.seconds > SECONDS_PER_DAY && typeof options.displayDays === 'undefined') {
            days = Math.floor(options.seconds / SECONDS_PER_DAY);
            options.displayDays = days < 10 && 1 || days < 100 && 2 || 3;
        }
        else if(options.displayDays === true) {
            options.displayDays = 3;
        }
        else if(options.displayDays) {
            options.displayDays = options.displayDays > 0 ? Math.floor(options.displayDays) : 3;
        }

        return this.each(function() {
            var $this = $(this),
                data = $this.data(),
                opt, defs = {}, i, css;

            if(data.intervalId) {
                clearInterval(data.intervalId);
                data.intervalId = null;
            }

            if(!data.vals) { // new clock
                if(data.opt) {
                    opt = data.options;
                }
                else {
                    opt = options;
                }

                // clone the defaults object
                for(i in defaults) {
                    if($.isArray(defaults[i])) {
                        defs[i] = defaults[i].slice(0);
                    }
                    else {
                        defs[i] = defaults[i];
                    }
                }

                data = $.extend(defs, opt);
                data.options = opt;

                data.height = Math.round(data.fontSize * 100 / 93) || data.height;
                data.width = Math.round(data.fontSize * 0.8 + data.height * 0.13) || data.width;
                data.displayHours = !!(data.displayDays || data.displayHours);

                css = {
                    fontFamily: data.fontFamily
                };
                if(data.fontSize > 0) {
                    css.fontSize = data.fontSize +'px';
                }

                $this
                    .addClass('timeTo')
                    .addClass('timeTo-'+ data.theme)
                    .css(css);

                var left = Math.round(data.height / 10),
                    ulhtml = '<ul style="left:'+ left +'px; top:-'+ data.height +'px"><li>0</li><li>0</li></ul></div>',
                    style = data.fontSize ? ' style="width:'+ data.width +'px; height:'+ data.height +'px;"' : ' style=""',
                    dhtml1 = '<div class="first"'+ style +'>'+ ulhtml,
                    dhtml2 = '<div'+ style +'>'+ ulhtml,
                    dot2 = '<span>:</span>',
                    maxWidth = Math.round(data.width * 2 + 3),
                    captionSize = data.captionSize || data.fontSize && Math.round(data.fontSize * 0.43),
                    fsStyleVal = captionSize ? 'font-size:'+ captionSize +'px;' : '',
                    fsStyle = captionSize ? ' style="'+ fsStyleVal +'"' : '',

                    thtml = (data.displayCaptions ?
                        (data.displayHours
                            ? '<figure style="max-width:'+ maxWidth +'px">$1<figcaption'+ fsStyle +'>'+ dictionary[data.lang].hours +'</figcaption></figure>'+ dot2
                            : '') +
                        '<figure style="max-width:'+ maxWidth +'px">$1<figcaption'+ fsStyle +'>'+ dictionary[data.lang].min +'</figcaption></figure>'+ dot2 +
                        '<figure style="max-width:'+ maxWidth +'px">$1<figcaption'+ fsStyle +'>'+ dictionary[data.lang].sec +'</figcaption></figure>'
                        : (data.displayHours ? '$1'+ dot2 : '') +'$1'+ dot2 +'$1'
                    ).replace(/\$1/g, dhtml1 + dhtml2);

                if(data.displayDays > 0) {
                    var marginRight = data.fontSize * 0.4 || defaults.gap,
                        dhtml = dhtml1;
                    for(i = data.displayDays - 1; i > 0; i--) {
                        dhtml += i === 1 ? dhtml2.replace('">', 'margin-right:'+ Math.round(marginRight) +'px">') : dhtml2;
                    }
                    thtml = (data.displayCaptions ?
                        '<figure style="width:'+ Math.round(data.width*data.displayDays + marginRight + 4) +'px">$1'
                            + '<figcaption style="'+ fsStyleVal +'padding-right:'+ Math.round(marginRight) +'px">'
                            + dictionary[data.lang].days +'</figcaption></figure>'
                        : '$1').replace(
                            /\$1/, dhtml
                        ) + thtml;
                }
                $this.html(thtml);
            }
            else if(method !== 'reset') { // exists clock
                $.extend(data, options);
            }
            
            var $digits = $this.find('div');

            if($digits.length < data.vals.length) {
                var dif = data.vals.length - $digits.length,
                    vals = data.vals, limits = data.limits;

                data.vals = [];
                data.limits = [];
                for(i = 0; i < $digits.length; i++) {
                    data.vals[i] = vals[dif + i];
                    data.limits[i] = limits[dif + i];
                }
                data.iSec = data.vals.length - 1;
                data.iHour = data.vals.length - 5;
            }
            data.sec = data.seconds;
            $this.data(data);
            
            if(method && methods[method]) {
                methods[ method ].call($this, data.seconds);
            }
            else if(data.start) {
                methods.start.call($this, data.seconds);
            }
            else {
                init.call($this, data.seconds);
            }
        });
    };


    function init(sec, force) {
        var data = this.data(),
            $digits = this.find('ul'),
            isInterval = false;

        if(!data.vals || $digits.length === 0) {
            return;
        }

        if(!sec) {
            sec = data.seconds;
        }

        if(data.intervalId) {
            isInterval = true;
            clearTimeout(data.intervalId);
        }

        var days = Math.floor(sec / SECONDS_PER_DAY),
            rest = days * SECONDS_PER_DAY,
            h = Math.floor((sec - rest) / SECONDS_PER_HOUR);

        rest += h * SECONDS_PER_HOUR;

        var m = Math.floor((sec - rest) / 60);
        
        rest += m * 60;
        
        var s = sec - rest,
            str = (days < 100 ? '0' + (days < 10 ? '0' : '') : '') + days + (h < 10 ? '0' : '') + h + (m < 10 ? '0' : '') + m + (s < 10 ? '0' : '') + s;

        for(var i = data.vals.length - 1, j = str.length - 1, v; i >= 0; i--, j--) {
            v = parseInt(str.substr(j, 1));
            data.vals[i] = v;
            $digits.eq(i).children().html(v);
        }
        if(isInterval || force) {
            var me = this;
            data.ttStartTime = $.now();
            data.intervalId = setTimeout(function() { tick.call(me); }, 1000);
            this.data('intervalId', data.intervalId);
        }
    }
        
    /**
     * Switch specified digit by digit index
     * @param {number} - digit index
     */
    function tick(digit) {
        var $digits = this.find('ul'),
            data = this.data();

        if(!data.vals || $digits.length == 0) {
            if(data.intervalId) {
                clearTimeout(data.intervalId);
                this.data('intervalId', null);
            }
            if(data.callback) {
                data.callback();
            }

            return;
        }
        if(digit == undefined) {
            digit = data.iSec;
        }

        var n = data.vals[digit],
            $ul = $digits.eq(digit),
            $li = $ul.children(),
            step = data.countdown ? -1 : 1;

        $li.eq(1).html(n);
        n += step;

        if(digit == data.iSec) {
            var tickTimeout = data.tickTimeout,
                timeDiff = $.now() - data.ttStartTime;

            data.sec += step;

            tickTimeout += Math.abs(data.seconds - data.sec) * tickTimeout - timeDiff;

            data.intervalId = setTimeout(function() { tick.call(me); }, tickTimeout);
        }
        
        if(n < 0 || n > data.limits[digit]) {
            if(n < 0) {
                n = data.limits[digit];
                if(digit == data.iHour && data.displayDays > 0 && digit > 0 && data.vals[digit-1] == 0) // fix for hours when day changing
                    n = 3;
            }
            else {
                n = 0;
            }

            if(digit > 0) {
                tick.call(this, digit-1);
            }
        }
        $li.eq(0).html(n);
        
        var me = this;
        
        if($.support.transition) {
            $ul.addClass('transition');
            $ul.css({top:0});

            setTimeout(function() {
                $ul.removeClass('transition');
                $li.eq(1).html(n);
                $ul.css({top:"-"+ data.height +"px"});

                if(step > 0 || digit != data.iSec) {
                    return;
                }

                if(data.sec == data.countdownAlertLimit) {
                    $digits.parent().addClass('timeTo-alert');
                }

                if(data.sec === 0) {
                    $digits.parent().removeClass('timeTo-alert');

                    if(data.intervalId) {
                        clearTimeout(data.intervalId);
                        me.data('intervalId', null);
                    }

                    if(typeof data.callback === 'function') {
                        data.callback();
                    }
                }
            }, 410);
        }
        else {
            $ul.stop().animate({top:0}, 400, digit != data.iSec ? null : function() {
                $li.eq(1).html(n);
                $ul.css({top:"-"+ data.height +"px"});
                if(step > 0 || digit != data.iSec) {
                    return;
                }

                if(data.sec == data.countdownAlertLimit) {
                    $digits.parent().addClass('timeTo-alert');
                }
                else if(data.sec == 0) {
                    $digits.parent().removeClass('timeTo-alert');

                    if(data.intervalId) {
                        clearTimeout(data.intervalId);
                        me.data('intervalId', null);
                    }

                    if(typeof data.callback === 'function') {
                        data.callback();
                    }
                }
            });
        }
        data.vals[digit] = n;
    }

    return jQuery;
    
}));
