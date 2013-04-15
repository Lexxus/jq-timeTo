TimeTo
=========

jQuery plugin - timer countdown digital clock

## Examples

### Countdown timer

#### Set delay in seconds

```javascript
$('#countdown').timeTo(100, function(){ alert('Countdown finished'); });
```

#### Set delay to specyfied datetime

```javascript
$('#countdown').timeTo(new Date('Dec 10 2013 00:00:00 GMT+0200 (EET)'));
```

#### Set captions and dark theme

```javascript
$('#countdown').timeTo({
    timeTo: new Date(new Date('Dec 10 2013 00:00:00 GMT+0200 (EET)')),
    theme: "black",
    displayCaptions: true
});
```

### Digital clock

```javascript
$('#clock-1').timeTo();
```

## Usage

```javascript
$(<selection>).timeTo([options]);
```
Whithout **options** it makes simple digital clock with current system time.

where **options** can be...

### Object
Object with initial settings:

* **callback**:   *function* that call when countdown end, default **null**;
* **countdown**:  *boolean* if false then it's as clock, default **true**;
* **countdownAlertLimit**: *integer* seconds left to countdown end after that clock apply CSS class *timeTo-alert*, default **10**;
* **displayDays**: *boolean* if true then section days is display, default **false**;
* **displayCaption**: *boolean* if true then captions display, default **false**;
* **lang**: *string* language for caption, available 'en', 'ru', 'ua', 'de', 'fr', 'sp', default **'en'**;
* **seconds**: *integer* initial time in seconds for countdown timer, default **0**;
* **start**: *boolean* if true - start timer automaticaly, else need execute .timeTo("start"), default **true**;
* **timeTo**: *date object* specify date and time for current time or for countdown to, default null.

### Integer
Initial setting for **seconds** option
```javascript
$('#clock').timeTo(100)
// is identical to
$('#clock').timeTo({
    seconds: 100
});
```

### Date object
Initial setting for **timeTo** option
```javascript
$('#clock').timeTo(new Date('Dec 10 2013 00:00:00'));
// is identical to
$('#clock').timeTo({
    timeTo: new Date('Dec 10 2013 00:00:00')
});
```

### String
Action for execute. Available: **'start'**, **'stop'**, **'reset'**.
