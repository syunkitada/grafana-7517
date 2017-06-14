///<reference path="../../../headers/common.d.ts" />

import config from 'app/core/config';
import _ from 'lodash';
import $ from 'jquery';
import coreModule from '../../core_module';

function typeaheadMatcher(item) {
  var str = this.query;
  if (str[0] === '/') { str = str.substring(1); }
  if (str[str.length - 1] === '/') { str = str.substring(0, str.length-1); }
  return item.toLowerCase().match(str.toLowerCase());
}

export class FormDropdownCtrl {
  inputElement: any;
  linkElement: any;
  model: any;
  display: any;
  text: any;
  options: any;
  cssClass: any;
  allowCustom: any;
  linkMode: boolean;
  cancelBlur: any;
  onChange: any;
  getOptions: any;
  optionCache: any;

  constructor(private $scope, $element, private $sce, private templateSrv) {
    this.inputElement = $element.find('input').first();
    this.linkElement = $element.find('a').first();
    this.linkMode = true;
    this.cancelBlur = null;

    if (!this.getOptions) {
      this.getOptions = () => {
        return Promise.resolve(this.options);
      };
    }

    // listen to model changes
    $scope.$watch("ctrl.model", this.modelChanged.bind(this));

    this.inputElement.attr('data-provide', 'typeahead');
    this.inputElement.typeahead({
      source: this.typeaheadSource.bind(this),
      minLength: 0,
      items: 10000,
      updater: this.typeaheadUpdater.bind(this),
      matcher: typeaheadMatcher,
    });

    // modify typeahead lookup
    // this = typeahead
    var typeahead = this.inputElement.data('typeahead');
    typeahead.lookup = function () {
      this.query = this.$element.val() || '';
      var items = this.source(this.query, $.proxy(this.process, this));
      return items ? this.process(items) : items;
    };

    this.linkElement.keydown(evt => {
      // trigger typeahead on down arrow or enter key
      if (evt.keyCode === 40 || evt.keyCode === 13) {
        this.linkElement.click();
      }
    });

    this.inputElement.blur(this.inputBlur.bind(this));
  }

  modelChanged(newVal) {
    if (_.isObject(this.model)) {
      this.updateDisplay(this.model.text);
    } else {

      // if we have text use it
      if (this.text) {
        this.updateDisplay(this.text);
      } else {
        // otherwise we need to do initial lookup, usually happens first time
        this.getOptions().then(options => {
          var item = _.find(options, {value: this.model});
          this.updateDisplay(item ? item.text : this.model);
        });
      }
    }
  }

  typeaheadSource(query, callback) {
    this.getOptions({$query: query}).then(options => {
      this.optionCache = options;

      // extract texts
      let optionTexts = _.map(options, 'text');

      // add custom values
      if (this.allowCustom) {
        if (_.indexOf(optionTexts, this.text) === -1) {
          options.unshift(this.text);
        }
      }

      callback(optionTexts);
    });
  }

  typeaheadUpdater(text) {
    if (text === this.text) {
      clearTimeout(this.cancelBlur);
      this.inputElement.focus();
      return text;
    }

    this.inputElement.val(text);
    this.switchToLink(true);
    return text;
  }

  switchToLink(fromClick) {
    if (this.linkMode && !fromClick) { return; }

    clearTimeout(this.cancelBlur);
    this.cancelBlur = null;
    this.linkMode = true;
    this.inputElement.hide();
    this.linkElement.show();
    this.updateValue(this.inputElement.val());
  }

  inputBlur() {
    // happens long before the click event on the typeahead options
    // need to have long delay because the blur
    this.cancelBlur = setTimeout(this.switchToLink.bind(this), 200);
  }

  updateValue(text) {
    if (text === '' || this.text === text) {
      return;
    }

    this.$scope.$apply(() => {
      var option = _.find(this.optionCache, {text: text});

      if (option) {
        if (_.isObject(this.model)) {
          this.model = option;
        } else {
          this.model = option.value;
        }
        this.text = option.text;
      } else if (this.allowCustom) {
        if (_.isObject(this.model)) {
          this.model.text = this.model.value = text;
        } else {
          this.model = text;
        }
        this.text = text;
      }

      // needs to call this after digest so
      // property is synced with outerscope
      this.$scope.$$postDigest(() => {
        this.$scope.$apply(() => {
          this.onChange({$option: option});
        });
      });

    });
  }

  updateDisplay(text) {
    this.text = text;
    this.display = this.$sce.trustAsHtml(this.templateSrv.highlightVariablesAsHtml(text));
  }

  open() {
    this.inputElement.show();

    this.inputElement.css('width', (Math.max(this.linkElement.width(), 80) + 16) + 'px');
    this.inputElement.focus();

    this.linkElement.hide();
    this.linkMode = false;

    var typeahead = this.inputElement.data('typeahead');
    if (typeahead) {
      this.inputElement.val('');
      typeahead.lookup();
    }
  }
}

const template =  `
<input type="text"
data-provide="typeahead"
class="gf-form-input"
spellcheck="false"
style="display:none"></input>

<a class="gf-form-label"
	 ng-class="ctrl.cssClass"
	 tabindex="1"
	 ng-click="ctrl.open()"
	 give-focus="ctrl.focus"
	 ng-bind-html="ctrl.display"></a>
`;

export function formDropdownDirective() {
  return {
    restrict: 'E',
    template: template,
    controller: FormDropdownCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      model: "=",
      options: "=",
      getOptions: "&",
      onChange: "&",
      cssClass: "@",
      allowCustom: "@",
    },
    link: function() {
    }
  };
}

coreModule.directive('gfFormDropdown', formDropdownDirective);
