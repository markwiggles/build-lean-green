/* jshint ignore:start */

/* jshint ignore:end */

define('lean-green/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'lean-green/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('lean-green/blueprints/ember-youtube', ['exports', 'ember-youtube/blueprints/ember-youtube'], function (exports, ember_youtube) {

	'use strict';



	exports.default = ember_youtube.default;

});
define('lean-green/components/ember-youtube', ['exports', 'ember', 'ember-youtube/components/ember-youtube'], function (exports, Ember, EmberYoutube) {

	'use strict';

	exports['default'] = EmberYoutube['default'];

});
define('lean-green/components/fa-icon', ['exports', 'ember-cli-font-awesome/components/fa-icon'], function (exports, fa_icon) {

	'use strict';



	exports.default = fa_icon.default;

});
define('lean-green/components/fa-list-icon', ['exports', 'ember-cli-font-awesome/components/fa-list-icon'], function (exports, fa_list_icon) {

	'use strict';



	exports.default = fa_list_icon.default;

});
define('lean-green/components/fa-list', ['exports', 'ember-cli-font-awesome/components/fa-list'], function (exports, fa_list) {

	'use strict';



	exports.default = fa_list.default;

});
define('lean-green/components/fa-stack', ['exports', 'ember-cli-font-awesome/components/fa-stack'], function (exports, fa_stack) {

	'use strict';



	exports.default = fa_stack.default;

});
define('lean-green/components/lf-outlet', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

	'use strict';

	exports['default'] = ember_internals.StaticOutlet;

});
define('lean-green/components/lf-overlay', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var COUNTER = '__lf-modal-open-counter';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'span',
    classNames: ['lf-overlay'],

    didInsertElement: function didInsertElement() {
      var body = Ember['default'].$('body');
      var counter = body.data(COUNTER) || 0;
      body.addClass('lf-modal-open');
      body.data(COUNTER, counter + 1);
    },

    willDestroy: function willDestroy() {
      var body = Ember['default'].$('body');
      var counter = body.data(COUNTER) || 0;
      body.data(COUNTER, counter - 1);
      if (counter < 2) {
        body.removeClass('lf-modal-open');
      }
    }
  });

});
define('lean-green/components/liquid-bind', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var LiquidBind = Ember['default'].Component.extend({
    tagName: '',
    positionalParams: ['value'] // needed for Ember 1.13.[0-5] and 2.0.0-beta.[1-3] support
  });

  LiquidBind.reopenClass({
    positionalParams: ['value']
  });

  exports['default'] = LiquidBind;

});
define('lean-green/components/liquid-child', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['liquid-child'],

    didInsertElement: function didInsertElement() {
      var $container = this.$();
      if ($container) {
        $container.css('visibility', 'hidden');
      }
      this.sendAction('liquidChildDidRender', this);
    }

  });

});
define('lean-green/components/liquid-container', ['exports', 'ember', 'liquid-fire/growable', 'lean-green/components/liquid-measured'], function (exports, Ember, Growable, liquid_measured) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(Growable['default'], {
    classNames: ['liquid-container'],

    lockSize: function lockSize(elt, want) {
      elt.outerWidth(want.width);
      elt.outerHeight(want.height);
    },

    unlockSize: function unlockSize() {
      var _this = this;

      var doUnlock = function doUnlock() {
        _this.updateAnimatingClass(false);
        var elt = _this.$();
        if (elt) {
          elt.css({ width: '', height: '' });
        }
      };
      if (this._scaling) {
        this._scaling.then(doUnlock);
      } else {
        doUnlock();
      }
    },

    // We're doing this manually instead of via classNameBindings
    // because it depends on upward-data-flow, which generates warnings
    // under Glimmer.
    updateAnimatingClass: function updateAnimatingClass(on) {
      if (this.isDestroyed || !this._wasInserted) {
        return;
      }
      if (arguments.length === 0) {
        on = this.get('liquidAnimating');
      } else {
        this.set('liquidAnimating', on);
      }
      if (on) {
        this.$().addClass('liquid-animating');
      } else {
        this.$().removeClass('liquid-animating');
      }
    },

    startMonitoringSize: Ember['default'].on('didInsertElement', function () {
      this._wasInserted = true;
      this.updateAnimatingClass();
    }),

    actions: {

      willTransition: function willTransition(versions) {
        if (!this._wasInserted) {
          return;
        }

        // Remember our own size before anything changes
        var elt = this.$();
        this._cachedSize = liquid_measured.measure(elt);

        // And make any children absolutely positioned with fixed sizes.
        for (var i = 0; i < versions.length; i++) {
          goAbsolute(versions[i]);
        }

        // Apply '.liquid-animating' to liquid-container allowing
        // any customizable CSS control while an animating is occuring
        this.updateAnimatingClass(true);
      },

      afterChildInsertion: function afterChildInsertion(versions) {
        var elt = this.$();
        var enableGrowth = this.get('enableGrowth') !== false;

        // Measure  children
        var sizes = [];
        for (var i = 0; i < versions.length; i++) {
          if (versions[i].view) {
            sizes[i] = liquid_measured.measure(versions[i].view.$());
          }
        }

        // Measure ourself again to see how big the new children make
        // us.
        var want = liquid_measured.measure(elt);
        var have = this._cachedSize || want;

        // Make ourself absolute
        if (enableGrowth) {
          this.lockSize(elt, have);
        } else {
          this.lockSize(elt, {
            height: Math.max(want.height, have.height),
            width: Math.max(want.width, have.width)
          });
        }

        // Make the children absolute and fixed size.
        for (i = 0; i < versions.length; i++) {
          goAbsolute(versions[i], sizes[i]);
        }

        // Kick off our growth animation
        if (enableGrowth) {
          this._scaling = this.animateGrowth(elt, have, want);
        }
      },

      afterTransition: function afterTransition(versions) {
        for (var i = 0; i < versions.length; i++) {
          goStatic(versions[i]);
        }
        this.unlockSize();
      }
    }
  });

  function goAbsolute(version, size) {
    if (!version.view) {
      return;
    }
    var elt = version.view.$();
    var pos = elt.position();
    if (!size) {
      size = liquid_measured.measure(elt);
    }
    elt.outerWidth(size.width);
    elt.outerHeight(size.height);
    elt.css({
      position: 'absolute',
      top: pos.top,
      left: pos.left
    });
  }

  function goStatic(version) {
    if (version.view && !version.view.isDestroyed) {
      version.view.$().css({ width: '', height: '', position: '' });
    }
  }

});
define('lean-green/components/liquid-if', ['exports', 'ember', 'liquid-fire/ember-internals'], function (exports, Ember, ember_internals) {

  'use strict';

  var LiquidIf = Ember['default'].Component.extend({
    positionalParams: ['predicate'], // needed for Ember 1.13.[0-5] and 2.0.0-beta.[1-3] support
    tagName: '',
    helperName: 'liquid-if',
    didReceiveAttrs: function didReceiveAttrs() {
      this._super();
      var predicate = ember_internals.shouldDisplay(this.getAttr('predicate'));
      this.set('showFirstBlock', this.inverted ? !predicate : predicate);
    }
  });

  LiquidIf.reopenClass({
    positionalParams: ['predicate']
  });

  exports['default'] = LiquidIf;

});
define('lean-green/components/liquid-measured', ['exports', 'liquid-fire/components/liquid-measured'], function (exports, liquid_measured) {

	'use strict';



	exports.default = liquid_measured.default;
	exports.measure = liquid_measured.measure;

});
define('lean-green/components/liquid-modal', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['liquid-modal'],
    currentContext: Ember['default'].computed('owner.modalContexts.lastObject', function () {
      var context = this.get('owner.modalContexts.lastObject');
      if (context) {
        context.view = this.innerView(context);
      }
      return context;
    }),

    owner: Ember['default'].inject.service('liquid-fire-modals'),

    innerView: function innerView(current) {
      var self = this,
          name = current.get('name'),
          container = this.get('container'),
          component = container.lookup('component-lookup:main').lookupFactory(name);
      Ember['default'].assert("Tried to render a modal using component '" + name + "', but couldn't find it.", !!component);

      var args = Ember['default'].copy(current.get('params'));

      args.registerMyself = Ember['default'].on('init', function () {
        self.set('innerViewInstance', this);
      });

      // set source so we can bind other params to it
      args._source = Ember['default'].computed(function () {
        return current.get("source");
      });

      var otherParams = current.get("options.otherParams");
      var from, to;
      for (from in otherParams) {
        to = otherParams[from];
        args[to] = Ember['default'].computed.alias("_source." + from);
      }

      var actions = current.get("options.actions") || {};

      // Override sendAction in the modal component so we can intercept and
      // dynamically dispatch to the controller as expected
      args.sendAction = function (name) {
        var actionName = actions[name];
        if (!actionName) {
          this._super.apply(this, Array.prototype.slice.call(arguments));
          return;
        }

        var controller = current.get("source");
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(actionName);
        controller.send.apply(controller, args);
      };

      return component.extend(args);
    },

    actions: {
      outsideClick: function outsideClick() {
        if (this.get('currentContext.options.dismissWithOutsideClick')) {
          this.send('dismiss');
        } else {
          proxyToInnerInstance(this, 'outsideClick');
        }
      },
      escape: function escape() {
        if (this.get('currentContext.options.dismissWithEscape')) {
          this.send('dismiss');
        } else {
          proxyToInnerInstance(this, 'escape');
        }
      },
      dismiss: function dismiss() {
        var source = this.get('currentContext.source'),
            proto = source.constructor.proto(),
            params = this.get('currentContext.options.withParams'),
            clearThem = {};

        for (var key in params) {
          if (proto[key] instanceof Ember['default'].ComputedProperty) {
            clearThem[key] = undefined;
          } else {
            clearThem[key] = proto[key];
          }
        }
        source.setProperties(clearThem);
      }
    }
  });

  function proxyToInnerInstance(self, message) {
    var vi = self.get('innerViewInstance');
    if (vi) {
      vi.send(message);
    }
  }

});
define('lean-green/components/liquid-outlet', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var LiquidOutlet = Ember['default'].Component.extend({
    positionalParams: ['inputOutletName'], // needed for Ember 1.13.[0-5] and 2.0.0-beta.[1-3] support
    tagName: '',
    didReceiveAttrs: function didReceiveAttrs() {
      this._super();
      this.set('outletName', this.attrs.inputOutletName || 'main');
    }
  });

  LiquidOutlet.reopenClass({
    positionalParams: ['inputOutletName']
  });

  exports['default'] = LiquidOutlet;

});
define('lean-green/components/liquid-spacer', ['exports', 'liquid-fire/components/liquid-spacer'], function (exports, liquid_spacer) {

	'use strict';



	exports.default = liquid_spacer.default;

});
define('lean-green/components/liquid-unless', ['exports', 'lean-green/components/liquid-if'], function (exports, LiquidIf) {

  'use strict';

  exports['default'] = LiquidIf['default'].extend({
    helperName: 'liquid-unless',
    layoutName: 'components/liquid-if',
    inverted: true
  });

});
define('lean-green/components/liquid-versions', ['exports', 'ember', 'liquid-fire/ember-internals'], function (exports, Ember, ember_internals) {

  'use strict';

  var get = Ember['default'].get;
  var set = Ember['default'].set;

  exports['default'] = Ember['default'].Component.extend({
    tagName: "",
    name: 'liquid-versions',

    transitionMap: Ember['default'].inject.service('liquid-fire-transitions'),

    didReceiveAttrs: function didReceiveAttrs() {
      this._super();
      if (!this.versions || this._lastVersion !== this.getAttr('value')) {
        this.appendVersion();
        this._lastVersion = this.getAttr('value');
      }
    },

    appendVersion: function appendVersion() {
      var versions = this.versions;
      var firstTime = false;
      var newValue = this.getAttr('value');
      var oldValue;

      if (!versions) {
        firstTime = true;
        versions = Ember['default'].A();
      } else {
        oldValue = versions[0];
      }

      // TODO: may need to extend the comparison to do the same kind of
      // key-based diffing that htmlbars is doing.
      if (!firstTime && (!oldValue && !newValue || oldValue === newValue)) {
        return;
      }

      this.notifyContainer('willTransition', versions);
      var newVersion = {
        value: newValue,
        shouldRender: newValue || get(this, 'renderWhenFalse')
      };
      versions.unshiftObject(newVersion);

      this.firstTime = firstTime;
      if (firstTime) {
        set(this, 'versions', versions);
      }

      if (!newVersion.shouldRender && !firstTime) {
        this._transition();
      }
    },

    _transition: function _transition() {
      var _this = this;

      var versions = get(this, 'versions');
      var transition;
      var firstTime = this.firstTime;
      this.firstTime = false;

      this.notifyContainer('afterChildInsertion', versions);

      transition = get(this, 'transitionMap').transitionFor({
        versions: versions,
        parentElement: Ember['default'].$(ember_internals.containingElement(this)),
        use: get(this, 'use'),
        // Using strings instead of booleans here is an
        // optimization. The constraint system can match them more
        // efficiently, since it treats boolean constraints as generic
        // "match anything truthy/falsy" predicates, whereas string
        // checks are a direct object property lookup.
        firstTime: firstTime ? 'yes' : 'no',
        helperName: get(this, 'name'),
        outletName: get(this, 'outletName')
      });

      if (this._runningTransition) {
        this._runningTransition.interrupt();
      }
      this._runningTransition = transition;

      transition.run().then(function (wasInterrupted) {
        // if we were interrupted, we don't handle the cleanup because
        // another transition has already taken over.
        if (!wasInterrupted) {
          _this.finalizeVersions(versions);
          _this.notifyContainer("afterTransition", versions);
        }
      }, function (err) {
        _this.finalizeVersions(versions);
        _this.notifyContainer("afterTransition", versions);
        throw err;
      });
    },

    finalizeVersions: function finalizeVersions(versions) {
      versions.replace(1, versions.length - 1);
    },

    notifyContainer: function notifyContainer(method, versions) {
      var target = get(this, 'notify');
      if (target) {
        target.send(method, versions);
      }
    },

    actions: {
      childDidRender: function childDidRender(child) {
        var version = get(child, 'version');
        set(version, 'view', child);
        this._transition();
      }
    }

  });

});
define('lean-green/components/liquid-with', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var LiquidWith = Ember['default'].Component.extend({
    name: 'liquid-with',
    positionalParams: ['value'], // needed for Ember 1.13.[0-5] and 2.0.0-beta.[1-3] support
    tagName: '',
    iAmDeprecated: Ember['default'].on('init', function () {
      Ember['default'].deprecate("liquid-with is deprecated, use liquid-bind instead -- it accepts a block now.");
    })
  });

  LiquidWith.reopenClass({
    positionalParams: ['value']
  });

  exports['default'] = LiquidWith;

});
define('lean-green/components/lm-container', ['exports', 'ember', 'liquid-fire/tabbable'], function (exports, Ember) {

  'use strict';

  /*
     Parts of this file were adapted from ic-modal

     https://github.com/instructure/ic-modal
     Released under The MIT License (MIT)
     Copyright (c) 2014 Instructure, Inc.
  */

  var lastOpenedModal = null;
  Ember['default'].$(document).on('focusin', handleTabIntoBrowser);

  function handleTabIntoBrowser() {
    if (lastOpenedModal) {
      lastOpenedModal.focus();
    }
  }

  exports['default'] = Ember['default'].Component.extend({
    classNames: ['lm-container'],
    attributeBindings: ['tabindex'],
    tabindex: 0,

    keyUp: function keyUp(event) {
      // Escape key
      if (event.keyCode === 27) {
        this.sendAction();
      }
    },

    keyDown: function keyDown(event) {
      // Tab key
      if (event.keyCode === 9) {
        this.constrainTabNavigation(event);
      }
    },

    didInsertElement: function didInsertElement() {
      this.focus();
      lastOpenedModal = this;
    },

    willDestroy: function willDestroy() {
      lastOpenedModal = null;
    },

    focus: function focus() {
      if (this.get('element').contains(document.activeElement)) {
        // just let it be if we already contain the activeElement
        return;
      }
      var target = this.$('[autofocus]');
      if (!target.length) {
        target = this.$(':tabbable');
      }

      if (!target.length) {
        target = this.$();
      }

      target[0].focus();
    },

    constrainTabNavigation: function constrainTabNavigation(event) {
      var tabbable = this.$(':tabbable');
      var finalTabbable = tabbable[event.shiftKey ? 'first' : 'last']()[0];
      var leavingFinalTabbable = finalTabbable === document.activeElement ||
      // handle immediate shift+tab after opening with mouse
      this.get('element') === document.activeElement;
      if (!leavingFinalTabbable) {
        return;
      }
      event.preventDefault();
      tabbable[event.shiftKey ? 'last' : 'first']()[0].focus();
    },

    click: function click(event) {
      if (event.target === this.get('element')) {
        this.sendAction('clickAway');
      }
    }
  });

});
define('lean-green/components/scroll-to', ['exports', 'ember-scroll-to/components/scroll-to'], function (exports, ScrollTo) {

	'use strict';

	exports['default'] = ScrollTo['default'];

});
define('lean-green/components/uni-form-checkbox', ['exports', 'ember-uni-form/components/uni-form-checkbox'], function (exports, uni_form_checkbox) {

	'use strict';



	exports.default = uni_form_checkbox.default;

});
define('lean-green/components/uni-form-input', ['exports', 'ember-uni-form/components/uni-form-input'], function (exports, uni_form_input) {

	'use strict';



	exports.default = uni_form_input.default;

});
define('lean-green/components/uni-form-messages', ['exports', 'ember-uni-form/components/uni-form-messages'], function (exports, uni_form_messages) {

	'use strict';



	exports.default = uni_form_messages.default;

});
define('lean-green/components/uni-form-radio-tag', ['exports', 'ember-uni-form/components/uni-form-radio-tag'], function (exports, uni_form_radio_tag) {

	'use strict';



	exports.default = uni_form_radio_tag.default;

});
define('lean-green/components/uni-form-radio', ['exports', 'ember-uni-form/components/uni-form-radio'], function (exports, uni_form_radio) {

	'use strict';



	exports.default = uni_form_radio.default;

});
define('lean-green/components/uni-form-select-tag', ['exports', 'ember-uni-form/components/uni-form-select-tag'], function (exports, uni_form_select_tag) {

	'use strict';



	exports.default = uni_form_select_tag.default;

});
define('lean-green/components/uni-form-select', ['exports', 'ember-uni-form/components/uni-form-select'], function (exports, uni_form_select) {

	'use strict';



	exports.default = uni_form_select.default;

});
define('lean-green/components/uni-form-submit', ['exports', 'ember-uni-form/components/uni-form-submit'], function (exports, uni_form_submit) {

	'use strict';



	exports.default = uni_form_submit.default;

});
define('lean-green/components/uni-form-textarea', ['exports', 'ember-uni-form/components/uni-form-textarea'], function (exports, uni_form_textarea) {

	'use strict';



	exports.default = uni_form_textarea.default;

});
define('lean-green/components/uni-form', ['exports', 'ember-uni-form/components/uni-form'], function (exports, uni_form) {

	'use strict';



	exports.default = uni_form.default;

});
define('lean-green/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('lean-green/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('lean-green/initializers/export-application-global', ['exports', 'ember', 'lean-green/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('lean-green/initializers/liquid-fire', ['exports', 'liquid-fire/router-dsl-ext', 'liquid-fire/ember-internals'], function (exports, __dep0__, ember_internals) {

  'use strict';

  // This initializer exists only to make sure that the following
  // imports happen before the app boots.
  ember_internals.registerKeywords();

  exports['default'] = {
    name: 'liquid-fire',
    initialize: function initialize() {}
  };

});
define('lean-green/instance-initializers/app-version', ['exports', 'lean-green/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/action.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/action.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/action.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/animate.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/animate.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/animate.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/components/liquid-measured.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire/components');
  test('modules/liquid-fire/components/liquid-measured.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/components/liquid-measured.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/components/liquid-spacer.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire/components');
  test('modules/liquid-fire/components/liquid-spacer.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/components/liquid-spacer.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/constrainables.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/constrainables.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/constrainables.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/constraint.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/constraint.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/constraint.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/constraints.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/constraints.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/constraints.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/dsl.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/dsl.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/dsl.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/ember-internals.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/ember-internals.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/ember-internals.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/growable.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/growable.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/growable.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/index.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/index.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/index.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/internal-rules.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/internal-rules.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/internal-rules.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/modal.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/modal.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/modal.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/modals.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/modals.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/modals.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/mutation-observer.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/mutation-observer.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/mutation-observer.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/promise.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/promise.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/promise.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/router-dsl-ext.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/router-dsl-ext.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/router-dsl-ext.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/rule.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/rule.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/rule.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/running-transition.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/running-transition.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/running-transition.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/tabbable.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/tabbable.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/tabbable.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/transition-map.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/transition-map.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/transition-map.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/velocity-ext.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/velocity-ext.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/velocity-ext.js should pass jshint.');
  });

});
define('lean-green/liquid-fire/tests/modules/liquid-fire/version-warnings.jshint', function () {

  'use strict';

  module('JSHint - modules/liquid-fire');
  test('modules/liquid-fire/version-warnings.js should pass jshint', function () {
    ok(true, 'modules/liquid-fire/version-warnings.js should pass jshint.');
  });

});
define('lean-green/mixins/finds-parent-form', ['exports', 'ember-uni-form/mixins/finds-parent-form'], function (exports, finds_parent_form) {

	'use strict';



	exports.default = finds_parent_form.default;

});
define('lean-green/mixins/has-uni-form', ['exports', 'ember-uni-form/mixins/has-uni-form'], function (exports, has_uni_form) {

	'use strict';



	exports.default = has_uni_form.default;

});
define('lean-green/mixins/triggers-change', ['exports', 'ember-uni-form/mixins/triggers-change'], function (exports, triggers_change) {

	'use strict';



	exports.default = triggers_change.default;

});
define('lean-green/models/uni-form-field', ['exports', 'ember-uni-form/models/uni-form-field'], function (exports, uni_form_field) {

	'use strict';



	exports.default = uni_form_field.default;

});
define('lean-green/models/uni-form', ['exports', 'ember-uni-form/models/uni-form'], function (exports, uni_form) {

	'use strict';



	exports.default = uni_form.default;

});
define('lean-green/router', ['exports', 'ember', 'lean-green/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route('about');
    this.route('training');
    this.route('vegucated');
    this.route('reviews');
    this.route('shop');
  });

  exports['default'] = Router;

});
define('lean-green/routes/about', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('lean-green/routes/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('lean-green/routes/reviews', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('lean-green/routes/shop', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('lean-green/routes/training', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('lean-green/routes/vegucated', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('lean-green/services/liquid-fire-modals', ['exports', 'liquid-fire/modals'], function (exports, Modals) {

	'use strict';

	exports['default'] = Modals['default'];

});
define('lean-green/services/liquid-fire-transitions', ['exports', 'liquid-fire/transition-map'], function (exports, TransitionMap) {

	'use strict';

	exports['default'] = TransitionMap['default'];

});
define('lean-green/services/validations', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var set = Ember['default'].set;

  exports['default'] = Ember['default'].Service.extend({
    init: function init() {
      set(this, 'cache', {});
    }
  });

});
define('lean-green/templates/about', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 5738
          }
        },
        "moduleName": "lean-green/templates/about.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","cd-main-content navigation-content");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2 first-item");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("The Lean & Green Story");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("It has been said that when the student is ready, the teacher will appear. Well my teacher came to me in the form of a gym friend, passionate cancer survivor and reformed meat eater by the name of Collette Jeffs.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Collette started talking to me about why I made the food choices that I did. She lent me the DVD ‘Forks Over Knives’ and sent me the YouTube link to watch ‘Earthlings’. Watching these opened my eyes and began my ‘Journey Down The Rabbit Hole’ as I like to call it. They made me question the impact on my health, the environment and the animals of continuing to eat what I was. And I decided right there and then not to climb out of the big gaping hole that had opened up around me and go back to my ‘normal’ way of eating. I decided to follow the white rabbit (Alice In Wonderland reference) and expose myself to a new world of compassionate choices.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("My decision to stop eating animals shocked a lot of people around me. And replacing meat, whey protein powders and eggs with other alternatives and choosing non-animal products for my daily living felt quite daunting.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","pull-right");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"src","assets/images/trophy-shot.jpg");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("As a natural bodybuilder these foods had been especially important in my previous nutrition plans to drop bodyfat and maintain/build muscle for my competitions. And my brain went to mush just trying to sort through all the information before me and work out if I could still achieve what I wanted to in bodybuilding. You see, I had made up my mind that 2013 was the year I was going to give my all to win my first overall natural bodybuilding title after 4 years of competing. I had won many of my divisions before but never an overall title. So changing my nutrition strategy so dramatically felt like a really big deal!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("What I suggest is visiting www.greatveganathletes.com. I'm sure these people had the same thoughts, and yet they overcame them to experience greatness in their chosen sport because what happened next put all my concerns to rest. Within just a few weeks of testing and then implementing my own plant powered nutrition plan, I found that my strength actually went up, my body fat levels came down, and my energy and recovery skyrocketed. I felt lighter inside and was enjoying being an advocate for these changes also.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("So by conquering my fears of muscle loss and worries of reduced performance, I actually began to achieve new personal bests in the gym using these healthier and ethically better nutrition choices.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("And then it happened! After many months of commitment, on the 15th September, 2013 I won my first overall natural bodybuilding title the biggest and best I’ve ever looked on stage. Seriously, who would have thought hey?! Definitely not me!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("The truth is we have all grown up with a food industry and government that promote the health benefits of consuming a lot of meat and dairy. The majority of people who renounce eating animals and their byproducts were once consuming a lot of them. I myself thought it was impossible to get good results as a natural bodybuilder and to stay healthy in general without consuming these foods. It makes you realize just how important it is to question the things we are led to believe are healthy by the big corporations that monopolize our T.V screens, magazines and billboards, and a processed food addicted, emotionally disconnected society.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Now for anyone reading this who hasn't already begun their plant-based journey, know that it is a choice that has its challenges. You will be bucking a system of animal use and abuse that has been ingrained in our society for way too long. You will suddenly make people feel uncomfortable about what's on their plate when they see and hear why it's not on yours.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("There are already over 400,000,000 vegetarians and vegans in the world today. But our world needs more people who are willing to stand out from the crowd and help others to grow in compassion. Our world needs more people who will speak up for the voiceless, the animals. Our world needs more people who will offer non-judgmental encouragement and help others along their plant-based journey, just as I try my best to do.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("So if you are ready to open your eyes (if you haven't already), here are my words of encouragement. Get Vegucated! And once you are, stay strong in your conviction. Because I know that you too will find that eating a plant powered diet is the healthiest and best decision you will ever make for your body, the animals, our environment, Our World!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-1");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("h3");
        dom.setAttribute(el4,"class","text-center");
        var el5 = dom.createTextNode("Trainer Qualifications");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("C.H.E.K Institute:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("C.H.E.K Practitioner Level III");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("CHEK Holistic Lifestyle Coach Level I");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Other Training:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("BA(Hons) Sports Science & History Personal Fitness Trainer");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Postgraduate Certificate in Business Management");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","pull-right");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"src","assets/images/family-pic.jpg");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Jarrod is a devoted husband and father of three young girls, and an accomplished sportsperson having won titles in several different disciplines. With over 13 years experience coaching clients to achieve their greatest ambitions, Jarrod established LEAN & GREEN to provide everything his clients need to create a happier, healthier, better looking (and feeling) version of themselves.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [0, 0, 4, 0]);
        var element2 = dom.childAt(element0, [2, 0, 0, 0]);
        var morphs = new Array(2);
        morphs[0] = dom.createAttrMorph(element1, 'height');
        morphs[1] = dom.createAttrMorph(element2, 'height');
        return morphs;
      },
      statements: [
        ["attribute","height",250],
        ["attribute","height",250]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 486
            },
            "end": {
              "line": 1,
              "column": 510
            }
          },
          "moduleName": "lean-green/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Home");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 531
            },
            "end": {
              "line": 1,
              "column": 560
            }
          },
          "moduleName": "lean-green/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("About L&G");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 581
            },
            "end": {
              "line": 1,
              "column": 616
            }
          },
          "moduleName": "lean-green/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Get Training");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 637
            },
            "end": {
              "line": 1,
              "column": 674
            }
          },
          "moduleName": "lean-green/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Get Vegucated");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 695
            },
            "end": {
              "line": 1,
              "column": 731
            }
          },
          "moduleName": "lean-green/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Raving Reviews");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child5 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 752
            },
            "end": {
              "line": 1,
              "column": 775
            }
          },
          "moduleName": "lean-green/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Shop");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 859
          }
        },
        "moduleName": "lean-green/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","navbar navbar-inverse navbar-fixed-top");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container-fluid");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","navbar-header");
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"data-target","#my-navbar");
        dom.setAttribute(el4,"data-toggle","collapse");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"class","navbar-toggle");
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","navbar-brand");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"src","assets/images/lean-green-logo-simple.png");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","my-navbar");
        dom.setAttribute(el3,"class","collapse navbar-collapse navbar-right");
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","nav navbar-nav");
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 0, 1, 0]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [0]),0,0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [2]),0,0);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [4]),0,0);
        morphs[5] = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
        morphs[6] = dom.createMorphAt(fragment,1,1,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","link-to",["index"],[],0,null,["loc",[null,[1,486],[1,522]]]],
        ["block","link-to",["about"],[],1,null,["loc",[null,[1,531],[1,572]]]],
        ["block","link-to",["training"],[],2,null,["loc",[null,[1,581],[1,628]]]],
        ["block","link-to",["vegucated"],[],3,null,["loc",[null,[1,637],[1,686]]]],
        ["block","link-to",["reviews"],[],4,null,["loc",[null,[1,695],[1,743]]]],
        ["block","link-to",["shop"],[],5,null,["loc",[null,[1,752],[1,787]]]],
        ["inline","liquid-outlet",[],["class","navigation-content"],["loc",[null,[1,815],[1,859]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  }()));

});
define('lean-green/templates/components/ember-youtube', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 7,
                "column": 34
              },
              "end": {
                "line": 7,
                "column": 56
              }
            },
            "moduleName": "lean-green/templates/components/ember-youtube.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Pause");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 7,
                "column": 56
              },
              "end": {
                "line": 7,
                "column": 68
              }
            },
            "moduleName": "lean-green/templates/components/ember-youtube.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Play");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child2 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 8,
                "column": 36
              },
              "end": {
                "line": 8,
                "column": 57
              }
            },
            "moduleName": "lean-green/templates/components/ember-youtube.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Unmute");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child3 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 8,
                "column": 57
              },
              "end": {
                "line": 8,
                "column": 69
              }
            },
            "moduleName": "lean-green/templates/components/ember-youtube.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Mute");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 1
            },
            "end": {
              "line": 10,
              "column": 1
            }
          },
          "moduleName": "lean-green/templates/components/ember-youtube.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("menu");
          dom.setAttribute(el1,"class","EmberYoutube-controls");
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n	");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [1]);
          var element4 = dom.childAt(element3, [1]);
          var element5 = dom.childAt(element3, [3]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element4);
          morphs[1] = dom.createMorphAt(element4,0,0);
          morphs[2] = dom.createElementMorph(element5);
          morphs[3] = dom.createMorphAt(element5,0,0);
          return morphs;
        },
        statements: [
          ["element","action",["togglePlay"],[],["loc",[null,[7,10],[7,33]]]],
          ["block","if",[["get","isPlaying",["loc",[null,[7,40],[7,49]]]]],[],0,1,["loc",[null,[7,34],[7,75]]]],
          ["element","action",["toggleVolume"],[],["loc",[null,[8,10],[8,35]]]],
          ["block","if",[["get","isMuted",["loc",[null,[8,42],[8,49]]]]],[],2,3,["loc",[null,[8,36],[8,76]]]]
        ],
        locals: [],
        templates: [child0, child1, child2, child3]
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 1
            },
            "end": {
              "line": 16,
              "column": 1
            }
          },
          "moduleName": "lean-green/templates/components/ember-youtube.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","EmberYoutube-time");
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("/");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element2,1,1);
          morphs[1] = dom.createMorphAt(element2,3,3);
          return morphs;
        },
        statements: [
          ["content","currentTimeFormatted",["loc",[null,[14,3],[14,27]]]],
          ["content","durationFormatted",["loc",[null,[14,28],[14,49]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 1
            },
            "end": {
              "line": 22,
              "column": 1
            }
          },
          "moduleName": "lean-green/templates/components/ember-youtube.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","EmberYoutube-progress");
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("progress");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element1, 'value');
          morphs[1] = dom.createAttrMorph(element1, 'max');
          return morphs;
        },
        statements: [
          ["attribute","value",["get","currentTimeValue",["loc",[null,[20,21],[20,37]]]]],
          ["attribute","max",["get","durationValue",["loc",[null,[20,46],[20,59]]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 24,
              "column": 1
            },
            "end": {
              "line": 33,
              "column": 1
            }
          },
          "moduleName": "lean-green/templates/components/ember-youtube.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","EmberYoutube-debug");
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("code");
          var el3 = dom.createTextNode("\n				ytid: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("br");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				playerState: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("br");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				isMuted: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("br");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				isPlaying: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("br");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(4);
          morphs[0] = dom.createMorphAt(element0,1,1);
          morphs[1] = dom.createMorphAt(element0,4,4);
          morphs[2] = dom.createMorphAt(element0,7,7);
          morphs[3] = dom.createMorphAt(element0,10,10);
          return morphs;
        },
        statements: [
          ["content","ytid",["loc",[null,[27,10],[27,18]]]],
          ["content","playerState",["loc",[null,[28,17],[28,32]]]],
          ["content","isMuted",["loc",[null,[29,13],[29,24]]]],
          ["content","isPlaying",["loc",[null,[30,15],[30,28]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 39,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/ember-youtube.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","EmberYoutube-player");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","EmberYoutube-controls");
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","EmberYoutube-yield");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element6 = dom.childAt(fragment, [2]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(element6,1,1);
        morphs[1] = dom.createMorphAt(element6,3,3);
        morphs[2] = dom.createMorphAt(element6,5,5);
        morphs[3] = dom.createMorphAt(element6,7,7);
        morphs[4] = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        return morphs;
      },
      statements: [
        ["block","if",[["get","showControls",["loc",[null,[5,7],[5,19]]]]],[],0,null,["loc",[null,[5,1],[10,8]]]],
        ["block","if",[["get","showTime",["loc",[null,[12,7],[12,15]]]]],[],1,null,["loc",[null,[12,1],[16,8]]]],
        ["block","if",[["get","showProgress",["loc",[null,[18,7],[18,19]]]]],[],2,null,["loc",[null,[18,1],[22,8]]]],
        ["block","if",[["get","showDebug",["loc",[null,[24,7],[24,16]]]]],[],3,null,["loc",[null,[24,1],[33,8]]]],
        ["content","yield",["loc",[null,[37,1],[37,10]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  }()));

});
define('lean-green/templates/components/liquid-bind', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 5,
                  "column": 4
                },
                "end": {
                  "line": 7,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-bind.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["inline","yield",[["get","version",["loc",[null,[6,15],[6,22]]]]],[],["loc",[null,[6,6],[6,26]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 7,
                  "column": 4
                },
                "end": {
                  "line": 9,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-bind.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["content","version",["loc",[null,[8,6],[8,20]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 11,
                "column": 0
              }
            },
            "moduleName": "lean-green/templates/components/liquid-bind.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","hasBlock",["loc",[null,[5,11],[5,19]]]]],[],0,1,["loc",[null,[5,4],[9,12]]]]
          ],
          locals: ["version"],
          templates: [child0, child1]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 12,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-bind.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-versions",[],["value",["subexpr","@mut",[["get","attrs.value",["loc",[null,[2,28],[2,39]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[2,44],[2,47]]]]],[],[]],"outletName",["subexpr","@mut",[["get","attrs.outletName",["loc",[null,[3,32],[3,48]]]]],[],[]],"name","liquid-bind","renderWhenFalse",true,"class",["subexpr","@mut",[["get","class",["loc",[null,[4,67],[4,72]]]]],[],[]]],0,null,["loc",[null,[2,2],[11,22]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            return {
              meta: {
                "topLevel": null,
                "revision": "Ember@2.1.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 25,
                    "column": 6
                  },
                  "end": {
                    "line": 27,
                    "column": 6
                  }
                },
                "moduleName": "lean-green/templates/components/liquid-bind.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
                dom.insertBoundary(fragment, 0);
                dom.insertBoundary(fragment, null);
                return morphs;
              },
              statements: [
                ["inline","yield",[["get","version",["loc",[null,[26,17],[26,24]]]]],[],["loc",[null,[26,8],[26,28]]]]
              ],
              locals: [],
              templates: []
            };
          }());
          var child1 = (function() {
            return {
              meta: {
                "topLevel": null,
                "revision": "Ember@2.1.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 27,
                    "column": 6
                  },
                  "end": {
                    "line": 29,
                    "column": 6
                  }
                },
                "moduleName": "lean-green/templates/components/liquid-bind.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
                dom.insertBoundary(fragment, 0);
                dom.insertBoundary(fragment, null);
                return morphs;
              },
              statements: [
                ["content","version",["loc",[null,[28,8],[28,22]]]]
              ],
              locals: [],
              templates: []
            };
          }());
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 21,
                  "column": 4
                },
                "end": {
                  "line": 31,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-bind.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["block","if",[["get","hasBlock",["loc",[null,[25,13],[25,21]]]]],[],0,1,["loc",[null,[25,6],[29,14]]]]
            ],
            locals: ["version"],
            templates: [child0, child1]
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 13,
                "column": 2
              },
              "end": {
                "line": 32,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-bind.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","liquid-versions",[],["value",["subexpr","@mut",[["get","attrs.value",["loc",[null,[21,30],[21,41]]]]],[],[]],"notify",["subexpr","@mut",[["get","container",["loc",[null,[21,49],[21,58]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[21,63],[21,66]]]]],[],[]],"outletName",["subexpr","@mut",[["get","attrs.outletName",["loc",[null,[22,34],[22,50]]]]],[],[]],"name","liquid-bind","renderWhenFalse",true],0,null,["loc",[null,[21,4],[31,26]]]]
          ],
          locals: ["container"],
          templates: [child0]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 0
            },
            "end": {
              "line": 33,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-bind.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-container",[],["id",["subexpr","@mut",[["get","id",["loc",[null,[14,9],[14,11]]]]],[],[]],"class",["subexpr","@mut",[["get","class",["loc",[null,[15,12],[15,17]]]]],[],[]],"growDuration",["subexpr","@mut",[["get","growDuration",["loc",[null,[16,19],[16,31]]]]],[],[]],"growPixelsPerSecond",["subexpr","@mut",[["get","growPixelsPerSecond",["loc",[null,[17,26],[17,45]]]]],[],[]],"growEasing",["subexpr","@mut",[["get","growEasing",["loc",[null,[18,17],[18,27]]]]],[],[]],"enableGrowth",["subexpr","@mut",[["get","enableGrowth",["loc",[null,[19,19],[19,31]]]]],[],[]]],0,null,["loc",[null,[13,2],[32,25]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 34,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/liquid-bind.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","containerless",["loc",[null,[1,6],[1,19]]]]],[],0,1,["loc",[null,[1,0],[33,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('lean-green/templates/components/liquid-container', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 14
          }
        },
        "moduleName": "lean-green/templates/components/liquid-container.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["inline","yield",[["get","this",["loc",[null,[1,8],[1,12]]]]],[],["loc",[null,[1,0],[1,14]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/components/liquid-if', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 4,
                  "column": 4
                },
                "end": {
                  "line": 6,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-if.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
              return morphs;
            },
            statements: [
              ["content","yield",["loc",[null,[5,6],[5,15]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 6,
                  "column": 4
                },
                "end": {
                  "line": 8,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-if.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
              return morphs;
            },
            statements: [
              ["inline","yield",[],["to","inverse"],["loc",[null,[7,6],[7,28]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 9,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-if.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","valueVersion",["loc",[null,[4,10],[4,22]]]]],[],0,1,["loc",[null,[4,4],[8,11]]]]
          ],
          locals: ["valueVersion"],
          templates: [child0, child1]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 10,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-if.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-versions",[],["value",["subexpr","@mut",[["get","showFirstBlock",["loc",[null,[2,27],[2,41]]]]],[],[]],"name",["subexpr","@mut",[["get","helperName",["loc",[null,[2,47],[2,57]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[3,27],[3,30]]]]],[],[]],"renderWhenFalse",["subexpr","hasBlock",["inverse"],[],["loc",[null,[3,47],[3,67]]]],"class",["subexpr","@mut",[["get","class",["loc",[null,[3,74],[3,79]]]]],[],[]]],0,null,["loc",[null,[2,2],[9,22]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            return {
              meta: {
                "topLevel": null,
                "revision": "Ember@2.1.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 21,
                    "column": 6
                  },
                  "end": {
                    "line": 23,
                    "column": 6
                  }
                },
                "moduleName": "lean-green/templates/components/liquid-if.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("        ");
                dom.appendChild(el0, el1);
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
                return morphs;
              },
              statements: [
                ["content","yield",["loc",[null,[22,8],[22,17]]]]
              ],
              locals: [],
              templates: []
            };
          }());
          var child1 = (function() {
            return {
              meta: {
                "topLevel": null,
                "revision": "Ember@2.1.0",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 23,
                    "column": 6
                  },
                  "end": {
                    "line": 25,
                    "column": 6
                  }
                },
                "moduleName": "lean-green/templates/components/liquid-if.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("        ");
                dom.appendChild(el0, el1);
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
                return morphs;
              },
              statements: [
                ["inline","yield",[],["to","inverse"],["loc",[null,[24,8],[24,30]]]]
              ],
              locals: [],
              templates: []
            };
          }());
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 19,
                  "column": 4
                },
                "end": {
                  "line": 26,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-if.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["block","if",[["get","valueVersion",["loc",[null,[21,12],[21,24]]]]],[],0,1,["loc",[null,[21,6],[25,13]]]]
            ],
            locals: ["valueVersion"],
            templates: [child0, child1]
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 11,
                "column": 2
              },
              "end": {
                "line": 27,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-if.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","liquid-versions",[],["value",["subexpr","@mut",[["get","showFirstBlock",["loc",[null,[19,29],[19,43]]]]],[],[]],"notify",["subexpr","@mut",[["get","container",["loc",[null,[19,51],[19,60]]]]],[],[]],"name",["subexpr","@mut",[["get","helperName",["loc",[null,[19,66],[19,76]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[20,8],[20,11]]]]],[],[]],"renderWhenFalse",["subexpr","hasBlock",["inverse"],[],["loc",[null,[20,28],[20,48]]]]],0,null,["loc",[null,[19,4],[26,24]]]]
          ],
          locals: ["container"],
          templates: [child0]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 0
            },
            "end": {
              "line": 28,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-if.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-container",[],["id",["subexpr","@mut",[["get","id",["loc",[null,[12,9],[12,11]]]]],[],[]],"class",["subexpr","@mut",[["get","class",["loc",[null,[13,12],[13,17]]]]],[],[]],"growDuration",["subexpr","@mut",[["get","growDuration",["loc",[null,[14,19],[14,31]]]]],[],[]],"growPixelsPerSecond",["subexpr","@mut",[["get","growPixelsPerSecond",["loc",[null,[15,26],[15,45]]]]],[],[]],"growEasing",["subexpr","@mut",[["get","growEasing",["loc",[null,[16,17],[16,27]]]]],[],[]],"enableGrowth",["subexpr","@mut",[["get","enableGrowth",["loc",[null,[17,19],[17,31]]]]],[],[]]],0,null,["loc",[null,[11,2],[27,23]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 29,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/liquid-if.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","containerless",["loc",[null,[1,6],[1,19]]]]],[],0,1,["loc",[null,[1,0],[28,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('lean-green/templates/components/liquid-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"role","dialog");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(4);
            morphs[0] = dom.createAttrMorph(element0, 'class');
            morphs[1] = dom.createAttrMorph(element0, 'aria-labelledby');
            morphs[2] = dom.createAttrMorph(element0, 'aria-label');
            morphs[3] = dom.createMorphAt(element0,1,1);
            return morphs;
          },
          statements: [
            ["attribute","class",["concat",["lf-dialog ",["get","cc.options.dialogClass",["loc",[null,[3,28],[3,50]]]]]]],
            ["attribute","aria-labelledby",["get","cc.options.ariaLabelledBy",["loc",[null,[3,86],[3,111]]]]],
            ["attribute","aria-label",["get","cc.options.ariaLabel",["loc",[null,[3,127],[3,147]]]]],
            ["inline","lf-vue",[["get","cc.view",["loc",[null,[4,15],[4,22]]]]],["dismiss","dismiss"],["loc",[null,[4,6],[4,42]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": false,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 8,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-modal.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          morphs[1] = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, 0);
          return morphs;
        },
        statements: [
          ["block","lm-container",[],["action","escape","clickAway","outsideClick"],0,null,["loc",[null,[2,2],[6,19]]]],
          ["content","lf-overlay",["loc",[null,[7,2],[7,16]]]]
        ],
        locals: ["cc"],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/liquid-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","liquid-versions",[],["name","liquid-modal","value",["subexpr","@mut",[["get","currentContext",["loc",[null,[1,45],[1,59]]]]],[],[]],"renderWhenFalse",false],0,null,["loc",[null,[1,0],[8,20]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('lean-green/templates/components/liquid-outlet', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 15,
                  "column": 6
                },
                "end": {
                  "line": 17,
                  "column": 6
                }
              },
              "moduleName": "lean-green/templates/components/liquid-outlet.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["inline","outlet",[["get","outletName",["loc",[null,[16,17],[16,27]]]]],[],["loc",[null,[16,8],[16,29]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 19,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-outlet.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","set-outlet-state",[["get","outletName",["loc",[null,[15,26],[15,36]]]],["get","version.outletState",["loc",[null,[15,37],[15,56]]]]],[],0,null,["loc",[null,[15,6],[17,28]]]]
          ],
          locals: ["version"],
          templates: [child0]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 20,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-outlet.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-bind",[["get","outletState",["loc",[null,[2,17],[2,28]]]]],["id",["subexpr","@mut",[["get","id",["loc",[null,[3,9],[3,11]]]]],[],[]],"class",["subexpr","@mut",[["get","class",["loc",[null,[4,12],[4,17]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[5,10],[5,13]]]]],[],[]],"name","liquid-outlet","outletName",["subexpr","@mut",[["get","outletName",["loc",[null,[7,17],[7,27]]]]],[],[]],"containerless",["subexpr","@mut",[["get","containerless",["loc",[null,[8,20],[8,33]]]]],[],[]],"growDuration",["subexpr","@mut",[["get","growDuration",["loc",[null,[9,19],[9,31]]]]],[],[]],"growPixelsPerSecond",["subexpr","@mut",[["get","growPixelsPerSecond",["loc",[null,[10,26],[10,45]]]]],[],[]],"growEasing",["subexpr","@mut",[["get","growEasing",["loc",[null,[11,17],[11,27]]]]],[],[]],"enableGrowth",["subexpr","@mut",[["get","enableGrowth",["loc",[null,[12,19],[12,31]]]]],[],[]]],0,null,["loc",[null,[2,2],[19,20]]]]
        ],
        locals: ["outletState"],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 21,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/liquid-outlet.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","get-outlet-state",[["get","outletName",["loc",[null,[1,21],[1,31]]]]],[],0,null,["loc",[null,[1,0],[20,21]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('lean-green/templates/components/liquid-versions', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 3,
                  "column": 4
                },
                "end": {
                  "line": 5,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-versions.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["inline","yield",[["get","version.value",["loc",[null,[4,14],[4,27]]]]],[],["loc",[null,[4,6],[4,31]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-versions.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","liquid-child",[],["version",["subexpr","@mut",[["get","version",["loc",[null,[3,28],[3,35]]]]],[],[]],"liquidChildDidRender","childDidRender","class",["subexpr","@mut",[["get","class",["loc",[null,[3,80],[3,85]]]]],[],[]]],0,null,["loc",[null,[3,4],[5,21]]]]
          ],
          locals: [],
          templates: [child0]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-versions.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","version.shouldRender",["loc",[null,[2,8],[2,28]]]]],[],0,null,["loc",[null,[2,2],[6,9]]]]
        ],
        locals: ["version"],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 8,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/liquid-versions.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","each",[["get","versions",["loc",[null,[1,8],[1,16]]]]],["key","@identity"],0,null,["loc",[null,[1,0],[7,9]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('lean-green/templates/components/liquid-with', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 4,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-with.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["inline","yield",[["get","version",["loc",[null,[3,13],[3,20]]]]],[],["loc",[null,[3,4],[3,24]]]]
          ],
          locals: ["version"],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-with.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-versions",[],["value",["subexpr","@mut",[["get","attrs.value",["loc",[null,[2,28],[2,39]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[2,44],[2,47]]]]],[],[]],"name",["subexpr","@mut",[["get","name",["loc",[null,[2,53],[2,57]]]]],[],[]],"class",["subexpr","@mut",[["get","class",["loc",[null,[2,64],[2,69]]]]],[],[]]],0,null,["loc",[null,[2,2],[4,23]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "topLevel": null,
              "revision": "Ember@2.1.0",
              "loc": {
                "source": null,
                "start": {
                  "line": 14,
                  "column": 4
                },
                "end": {
                  "line": 16,
                  "column": 4
                }
              },
              "moduleName": "lean-green/templates/components/liquid-with.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [
              ["inline","yield",[["get","version",["loc",[null,[15,15],[15,22]]]]],[],["loc",[null,[15,6],[15,26]]]]
            ],
            locals: ["version"],
            templates: []
          };
        }());
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 2
              },
              "end": {
                "line": 17,
                "column": 2
              }
            },
            "moduleName": "lean-green/templates/components/liquid-with.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","liquid-versions",[],["value",["subexpr","@mut",[["get","attrs.value",["loc",[null,[14,30],[14,41]]]]],[],[]],"notify",["subexpr","@mut",[["get","container",["loc",[null,[14,49],[14,58]]]]],[],[]],"use",["subexpr","@mut",[["get","use",["loc",[null,[14,63],[14,66]]]]],[],[]],"name",["subexpr","@mut",[["get","name",["loc",[null,[14,72],[14,76]]]]],[],[]]],0,null,["loc",[null,[14,4],[16,25]]]]
          ],
          locals: ["container"],
          templates: [child0]
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 0
            },
            "end": {
              "line": 18,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/components/liquid-with.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","liquid-container",[],["id",["subexpr","@mut",[["get","id",["loc",[null,[7,9],[7,11]]]]],[],[]],"class",["subexpr","@mut",[["get","class",["loc",[null,[8,12],[8,17]]]]],[],[]],"growDuration",["subexpr","@mut",[["get","growDuration",["loc",[null,[9,19],[9,31]]]]],[],[]],"growPixelsPerSecond",["subexpr","@mut",[["get","growPixelsPerSecond",["loc",[null,[10,26],[10,45]]]]],[],[]],"growEasing",["subexpr","@mut",[["get","growEasing",["loc",[null,[11,17],[11,27]]]]],[],[]],"enableGrowth",["subexpr","@mut",[["get","enableGrowth",["loc",[null,[12,19],[12,31]]]]],[],[]]],0,null,["loc",[null,[6,2],[17,23]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 19,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/components/liquid-with.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","containerless",["loc",[null,[1,6],[1,19]]]]],[],0,1,["loc",[null,[1,0],[18,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('lean-green/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 2948
          }
        },
        "moduleName": "lean-green/templates/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("main");
        dom.setAttribute(el1,"class","cd-main-content navigation-content");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-1");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content col-md-12");
        var el4 = dom.createElement("h1");
        dom.setAttribute(el4,"style","font-weight:bold;padding-bottom:50px;margin-top:200px;");
        dom.setAttribute(el4,"class","first-item");
        var el5 = dom.createTextNode("Let's Get You Fitter and Healthier Sooner!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"style","margin-left:-2em;");
        dom.setAttribute(el4,"class","fixed-col col-md-6 col-xs-6");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"src","assets/images/iphone6.png");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("Download Our New App");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"style","margin-left:2em;");
        dom.setAttribute(el4,"class","fixed-col col-md-6 col-xs-6");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"src","assets/images/perf-pack.png");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("Shop For Healthy Food");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-1");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("Get Back In Control of Your Life");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","assets/images/home-image-success.jpg");
        dom.setAttribute(el4,"class","pull-right");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("We design personal programmes to restore the balance in your life, enabling you to have more time, energy, money, intimacy, and fun.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("During your session you will clear away physical and emotional clutter, define your priorities, set goals, and begin to take the steps required to reach them. ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-2");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        dom.setAttribute(el4,"class","form-heading");
        var el5 = dom.createTextNode("What Benefits Do You Want?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("h3");
        var el5 = dom.createTextNode("The New Version of You");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","assets/images/home-jump.png");
        dom.setAttribute(el4,"class","pull-right");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Lose weight, shed bodyfat, gain weight, build muscle, shape your body, enhance your physique, compete, improve your posture, improve your movement grace.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Relieve stress, increase energy, enhance relaxation, rehabilitate injuries, achieve vibrant health, gain vitality, like what you see in the mirror, feel great naked!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Run faster, jump higher, perform at your peak in your sport, maximise your daily strength, improve your work performance, go home feeling alive (and a little dead at the same time), dance up a storm, improve your digestion, improve your nutrition and eating habits, enhance your libido and sexual performance.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-3");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        dom.setAttribute(el4,"style","margin-top:4em");
        dom.setAttribute(el4,"class","form-heading");
        var el5 = dom.createTextNode("What Are Your Goals?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-3");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","assets/images/jarrod-spot.jpg");
        dom.setAttribute(el4,"class","pull-right");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("You will achieve better health, strength, fitness and flexibility by keeping you accountable and consistent in performing your personalised healthy lifestyle plan.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("You will improve your mobility, coordination and balance, to move better, look great and feel fantastic!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("You will be fitter and stronger, enhancing your confidence and self-esteem.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("You will look great naked, no matter what your age!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-4");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        var el5 = dom.createTextNode("Let's Get Started");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [0, 0]);
        var element2 = dom.childAt(element1, [1, 0]);
        var element3 = dom.childAt(element1, [2, 0]);
        var element4 = dom.childAt(element0, [1, 0, 1]);
        var element5 = dom.childAt(element0, [3, 0, 1]);
        var element6 = dom.childAt(element0, [5, 0, 0]);
        var morphs = new Array(7);
        morphs[0] = dom.createAttrMorph(element2, 'height');
        morphs[1] = dom.createAttrMorph(element3, 'height');
        morphs[2] = dom.createAttrMorph(element4, 'height');
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [2, 0]),1,1);
        morphs[4] = dom.createAttrMorph(element5, 'height');
        morphs[5] = dom.createMorphAt(dom.childAt(element0, [4, 0]),1,1);
        morphs[6] = dom.createAttrMorph(element6, 'height');
        return morphs;
      },
      statements: [
        ["attribute","height",200],
        ["attribute","height",180],
        ["attribute","height",250],
        ["inline","partial",["partials/wants-form"],[],["loc",[null,[1,1204],[1,1237]]]],
        ["attribute","height",300],
        ["inline","partial",["partials/goals-form"],[],["loc",[null,[1,2218],[1,2251]]]],
        ["attribute","height",250]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/partials/-conditions-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 2421
          }
        },
        "moduleName": "lean-green/templates/partials/-conditions-form.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"id","conditions-form");
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","col-md-5");
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-1");
        dom.setAttribute(el6,"name","1");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-1");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Back Pain");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-2");
        dom.setAttribute(el6,"name","2");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-2");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Chronic Injury");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-3");
        dom.setAttribute(el6,"name","3");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-3");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Poor Posture");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-4");
        dom.setAttribute(el6,"name","4");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-4");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Weight Loss");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-5");
        dom.setAttribute(el6,"name","5");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-5");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Weight Gain");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","col-md-7");
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-6");
        dom.setAttribute(el6,"name","6");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-6");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Degenerative Joint Pain");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-7");
        dom.setAttribute(el6,"name","7");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-7");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Osteoporosis");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-8");
        dom.setAttribute(el6,"name","8");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-8");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Inflammation");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-conditions-9");
        dom.setAttribute(el6,"name","9");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-conditions-9");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Chronic Stress");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/partials/-goals-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 1285
          }
        },
        "moduleName": "lean-green/templates/partials/-goals-form.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"id","goals-form");
        var el2 = dom.createElement("table");
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-goals-1");
        dom.setAttribute(el6,"name","1");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-goals-1");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("General Health");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-goals-2");
        dom.setAttribute(el6,"name","2");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-goals-2");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Strength");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-goals-3");
        dom.setAttribute(el6,"name","3");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-goals-3");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Fitness and Stamina");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-goals-4");
        dom.setAttribute(el6,"name","4");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-goals-4");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Flexibility");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-goals-5");
        dom.setAttribute(el6,"name","5");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-goals-5");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Weight Control");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/partials/-wants-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 822
          }
        },
        "moduleName": "lean-green/templates/partials/-wants-form.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"id","wants-form");
        var el2 = dom.createElement("table");
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-1");
        dom.setAttribute(el6,"name","1");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-1");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("I want to look healthier and fitter");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-2");
        dom.setAttribute(el6,"name","2");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-2");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("I want to feel better physically");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-q");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","checkboxFive");
        var el6 = dom.createElement("input");
        dom.setAttribute(el6,"id","checkboxFiveInput-3");
        dom.setAttribute(el6,"name","3");
        dom.setAttribute(el6,"type","checkbox");
        dom.setAttribute(el6,"value","1");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","checkboxFiveInput-3");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        dom.setAttribute(el4,"class","checkbox-text");
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("I want to function better at work and home");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/reviews', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 1650
          }
        },
        "moduleName": "lean-green/templates/reviews.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","cd-main-content navigation-content");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2 first-item");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("What some of Our Clients Are Saying...");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Here are some samples of testimonials from our happy clients. Whilst everyone's specific goals, level of fitness, commitment and motivation is different, we hope that these testimonials help to inspire you with what is possible with the right trainer helping you along the way.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Feel free to contact me to discuss helping you to be a great success story!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("blockquote");
        var el5 = dom.createTextNode("I decided that I needed to see someone about changing my body shape and just a general refresher about what I wanted to achieve out of my gym work. Jarrod gave me the motivation and encouragement to push myself a little harder to achieve the desired results. I found his exercises to be really exciting and fun and easy to do both at the gym and at home rather than restricting myself to one place. He has a 'can-do' attitude that helps you push yourself to achieve any exercise he gives you.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"style","margin-top:-2em;");
        dom.setAttribute(el4,"class","text-right");
        var el5 = dom.createElement("em");
        var el6 = dom.createTextNode("Mary Smith");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("blockquote");
        var el5 = dom.createTextNode(" I am so glad I started my program with Jarrod, I couldn't ask for a better fit. He's tough; however he gives me that little extra push I need that without I wouldn't achieve. Jarrod understands about the days when you just can't muster up the strength that you had on good days, but also helps me jump into the workout with a positive attitude and I really look forward to the days that I train.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"style","margin-top:-2em;");
        dom.setAttribute(el4,"class","text-right");
        var el5 = dom.createElement("em");
        var el6 = dom.createTextNode("Julie Brown");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/shop', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 296
          }
        },
        "moduleName": "lean-green/templates/shop.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","cd-main-content navigation-content");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"style","min-height:800px;");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2 first-item");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Order Your Healthy Products Now");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","assets/images/perf-pack.png");
        dom.setAttribute(el4,"class","pull-left");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 0, 0, 1]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'height');
        return morphs;
      },
      statements: [
        ["attribute","height",300]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/training', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 2511
          }
        },
        "moduleName": "lean-green/templates/training.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","cd-main-content navigation-content");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-6 first-item");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        dom.setAttribute(el4,"style","margin:2em;");
        var el5 = dom.createTextNode("Evolved Training Methods");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Corrective Exersize to High Performance Training");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Our exercise programs are based on the training and teachings of the world-renowned ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","http://chekinstitute.com/Advanced_Training_Programs/");
        dom.setAttribute(el5,"target","blank");
        var el6 = dom.createTextNode("C.H.E.K. Institute");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(", located in California USA. Committed to a holistic approach, C.H.E.K Practitioners are widely-recognized as the finest and most highly trained exercise therapists, strength & conditioning specialists and nutrition and lifestyle coaches in the world!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"style","padding: 1em 0;");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Do you suffer from any of the following conditions?");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"style","float:left");
        var el5 = dom.createTextNode("The C.H.E.K approach to corrective exercise can assist you to overcome these conditions, and more.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"style","min-height:500px;");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-6");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        dom.setAttribute(el4,"style","margin:2em;");
        var el5 = dom.createTextNode("Programs To Restore");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" Optimal Health and Vitality");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Your Journey");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("This begins with an assessment of your current physical, emotional and mental condition.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("I will then design a corrective exercise program to not only address any pain you are experiencing but to focus on the underlying cause of these dysfunctions. The program will enable you to restore optimal health and vitality.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Initially I will have you complete a series of questionnaires. These can all be done via my website. After you have completed your questionnaires, I will review them and contact you to set-up a Comprehensive Postural Assessment.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("After your assessment, I will design a customised exercise program based on both your assessment and submitted questionnaires. Exercise programs generally consist of corrective stretches along with resistance & cardio training, depending on your needs. You will receive an easy-to-follow detailed description of your exercise program, including acute variables such as Rest, Tempo, Intensity, Duration, Repetitions and Sets. This information along with Video clips of each of your exercises is all available for you to view via my website.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [0, 0]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 0]),3,3);
        return morphs;
      },
      statements: [
        ["inline","ember-youtube",[],["ytid","cVfgLRjhkhc","autoplay",true],["loc",[null,[1,178],[1,228]]]],
        ["inline","partial",["partials/conditions-form"],[],["loc",[null,[1,924],[1,962]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/templates/uni-form-label-and-message', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 0
            },
            "end": {
              "line": 4,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/uni-form-label-and-message.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","label");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element1, 'data-text');
          morphs[1] = dom.createMorphAt(element1,0,0);
          return morphs;
        },
        statements: [
          ["attribute","data-text",["concat",[["get","label",["loc",[null,[3,36],[3,41]]]]]]],
          ["content","label",["loc",[null,[3,46],[3,57]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 0
            },
            "end": {
              "line": 8,
              "column": 0
            }
          },
          "moduleName": "lean-green/templates/uni-form-label-and-message.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createAttrMorph(element0, 'data-text');
          morphs[2] = dom.createMorphAt(element0,0,0);
          return morphs;
        },
        statements: [
          ["attribute","class",["concat",[["get","message.tone",["loc",[null,[7,18],[7,30]]]]," message"]]],
          ["attribute","data-text",["concat",[["get","message.body",["loc",[null,[7,57],[7,69]]]]]]],
          ["content","message.body",["loc",[null,[7,74],[7,92]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 0
          }
        },
        "moduleName": "lean-green/templates/uni-form-label-and-message.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
        morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","label",["loc",[null,[2,6],[2,11]]]]],[],0,null,["loc",[null,[2,0],[4,7]]]],
        ["block","if",[["get","message",["loc",[null,[6,6],[6,13]]]]],[],1,null,["loc",[null,[6,0],[8,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('lean-green/templates/vegucated', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 1989
          }
        },
        "moduleName": "lean-green/templates/vegucated.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","cd-main-content navigation-content");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-5 first-item");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        dom.setAttribute(el4,"style","margin-top:2em;");
        var el5 = dom.createTextNode("It’s time our community got");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("VEGUCATED");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" LEAN & GREEN style!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-2");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("p");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Evolved Nutrition");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("When most people think of the word diet, they think of something people go on for a short period of time to lose weight. However the actual meaning of the word diet would be better described as the kinds of foods a person or community habitually eat.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("The Standard  Australian Diet (what most people in our community consider normal eating) is unfortunately far from optimal for long-term health and wellness. Our food courts and supermarkets are filled with overweight adults and kids. Our lunch boxes are full of white bread, processed ham, antibiotic and hormone-riddled meat, and packaged goods not even fit enough for an ant to eat.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-fixed-bg cd-bg-5");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-fixed-bg-content");
        var el4 = dom.createElement("h2");
        dom.setAttribute(el4,"style","margin-top:2em;");
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Cutting Edge Science");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("based on");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("strong");
        var el6 = dom.createTextNode("Plant-Based Nutrition");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","cd-scrolling-bg cd-color-1");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cd-container");
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","assets/images/green-man.jpg");
        dom.setAttribute(el4,"class","pull-right");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("The LEAN & GREEN Nutrition Program will educate you on the most cutting edge science and research available on plant-based nutrition. It will open you up to a new world of healthy, cruelty-free meal choices. It will help you to bring to life this new knowledge by providing you with the recipes, cooking classes and support you need to make this a sustainable healthy lifestyle choice, not just a diet!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("This is a way of eating that aims to provide you with optimal health for life and control over your eating habits for good and you can be sure LEAN & GREEN will support you every step of the way!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 0, 0]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'height');
        return morphs;
      },
      statements: [
        ["attribute","height",300]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('lean-green/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('lean-green/tests/helpers/resolver', ['exports', 'ember/resolver', 'lean-green/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('lean-green/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('lean-green/tests/helpers/start-app', ['exports', 'ember', 'lean-green/app', 'lean-green/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('lean-green/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('lean-green/tests/helpers/validate-properties', ['exports', 'ember', 'ember-qunit'], function (exports, Ember, ember_qunit) {

  'use strict';

  exports.testValidPropertyValues = testValidPropertyValues;
  exports.testInvalidPropertyValues = testInvalidPropertyValues;

  var run = Ember['default'].run;

  function validateValues(object, propertyName, values, isTestForValid) {
    var promise = null;
    var validatedValues = [];

    values.forEach(function (value) {
      function handleValidation() {
        var hasErrors = object.get('validationErrors.' + propertyName + '.firstObject');
        if (hasErrors && !isTestForValid || !hasErrors && isTestForValid) {
          validatedValues.push(value);
        }
      }

      run(object, 'set', propertyName, value);

      var objectPromise = null;
      run(function () {
        objectPromise = object.validate().then(handleValidation, handleValidation);
      });

      // Since we are setting the values in a different run loop as we are validating them,
      // we need to chain the promises so that they run sequentially. The wrong value will
      // be validated if the promises execute concurrently
      promise = promise ? promise.then(objectPromise) : objectPromise;
    });

    return promise.then(function () {
      return validatedValues;
    });
  }

  function testPropertyValues(propertyName, values, isTestForValid, context) {
    var validOrInvalid = isTestForValid ? 'Valid' : 'Invalid';
    var testName = validOrInvalid + ' ' + propertyName;

    ember_qunit.test(testName, function (assert) {
      var object = this.subject();

      if (context && typeof context === 'function') {
        context(object);
      }

      // Use QUnit.dump.parse so null and undefined can be printed as literal 'null' and
      // 'undefined' strings in the assert message.
      var valuesString = QUnit.dump.parse(values).replace(/\n(\s+)?/g, '').replace(/,/g, ', ');
      var assertMessage = 'Expected ' + propertyName + ' to have ' + validOrInvalid.toLowerCase() + ' values: ' + valuesString;

      return validateValues(object, propertyName, values, isTestForValid).then(function (validatedValues) {
        assert.deepEqual(validatedValues, values, assertMessage);
      });
    });
  }

  function testValidPropertyValues(propertyName, values, context) {
    testPropertyValues(propertyName, values, true, context);
  }

  function testInvalidPropertyValues(propertyName, values, context) {
    testPropertyValues(propertyName, values, false, context);
  }

});
define('lean-green/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('lean-green/tests/routes/about.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/about.js should pass jshint', function() { 
    ok(true, 'routes/about.js should pass jshint.'); 
  });

});
define('lean-green/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('lean-green/tests/routes/reviews.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/reviews.js should pass jshint', function() { 
    ok(true, 'routes/reviews.js should pass jshint.'); 
  });

});
define('lean-green/tests/routes/shop.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/shop.js should pass jshint', function() { 
    ok(true, 'routes/shop.js should pass jshint.'); 
  });

});
define('lean-green/tests/routes/training.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/training.js should pass jshint', function() { 
    ok(true, 'routes/training.js should pass jshint.'); 
  });

});
define('lean-green/tests/routes/vegucated.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/vegucated.js should pass jshint', function() { 
    ok(true, 'routes/vegucated.js should pass jshint.'); 
  });

});
define('lean-green/tests/test-helper', ['lean-green/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('lean-green/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('lean-green/tests/transitions.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('transitions.js should pass jshint', function() { 
    ok(false, 'transitions.js should pass jshint.\ntransitions.js: line 3, col 9, \'durationTime\' is defined but never used.\n\n1 error'); 
  });

});
define('lean-green/tests/unit/routes/about-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:about', 'Unit | Route | about', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('lean-green/tests/unit/routes/about-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/about-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/about-test.js should pass jshint.'); 
  });

});
define('lean-green/tests/unit/routes/reviews-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:reviews', 'Unit | Route | reviews', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('lean-green/tests/unit/routes/reviews-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/reviews-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/reviews-test.js should pass jshint.'); 
  });

});
define('lean-green/tests/unit/routes/shop-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:shop', 'Unit | Route | shop', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('lean-green/tests/unit/routes/shop-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/shop-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/shop-test.js should pass jshint.'); 
  });

});
define('lean-green/tests/unit/routes/training-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:training', 'Unit | Route | training', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('lean-green/tests/unit/routes/training-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/training-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/training-test.js should pass jshint.'); 
  });

});
define('lean-green/tests/unit/routes/vegucated-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:vegucated', 'Unit | Route | vegucated', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('lean-green/tests/unit/routes/vegucated-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/vegucated-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/vegucated-test.js should pass jshint.'); 
  });

});
define('lean-green/transitions', ['exports'], function (exports) {

	'use strict';

	exports['default'] = function () {

		var durationTime = 500;

		this.transition(this.matchSelector('.navigation-content'), this.use('crossFade'));
	}

});
define('lean-green/transitions/cross-fade', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = crossFade;
  // BEGIN-SNIPPET cross-fade-definition
  function crossFade() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    liquid_fire.stop(this.oldElement);
    return liquid_fire.Promise.all([liquid_fire.animate(this.oldElement, { opacity: 0 }, opts), liquid_fire.animate(this.newElement, { opacity: [opts.maxOpacity || 1, 0] }, opts)]);
  }

  // END-SNIPPET

});
define('lean-green/transitions/default', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = defaultTransition;
  function defaultTransition() {
    if (this.newElement) {
      this.newElement.css({ visibility: '' });
    }
    return liquid_fire.Promise.resolve();
  }

});
define('lean-green/transitions/explode', ['exports', 'ember', 'liquid-fire'], function (exports, Ember, liquid_fire) {

  'use strict';



  exports['default'] = explode;

  function explode() {
    var _this = this;

    var seenElements = {};
    var sawBackgroundPiece = false;

    for (var _len = arguments.length, pieces = Array(_len), _key = 0; _key < _len; _key++) {
      pieces[_key] = arguments[_key];
    }

    var promises = pieces.map(function (piece) {
      if (piece.matchBy) {
        return matchAndExplode(_this, piece, seenElements);
      } else if (piece.pick || piece.pickOld || piece.pickNew) {
        return explodePiece(_this, piece, seenElements);
      } else {
        sawBackgroundPiece = true;
        return runAnimation(_this, piece);
      }
    });
    if (!sawBackgroundPiece) {
      if (this.newElement) {
        this.newElement.css({ visibility: '' });
      }
      if (this.oldElement) {
        this.oldElement.css({ visibility: 'hidden' });
      }
    }
    return liquid_fire.Promise.all(promises);
  }

  function explodePiece(context, piece, seen) {
    var childContext = Ember['default'].copy(context);
    var selectors = [piece.pickOld || piece.pick, piece.pickNew || piece.pick];
    var cleanupOld, cleanupNew;

    if (selectors[0] || selectors[1]) {
      cleanupOld = _explodePart(context, 'oldElement', childContext, selectors[0], seen);
      cleanupNew = _explodePart(context, 'newElement', childContext, selectors[1], seen);
      if (!cleanupOld && !cleanupNew) {
        return liquid_fire.Promise.resolve();
      }
    }

    return runAnimation(childContext, piece)["finally"](function () {
      if (cleanupOld) {
        cleanupOld();
      }
      if (cleanupNew) {
        cleanupNew();
      }
    });
  }

  function _explodePart(context, field, childContext, selector, seen) {
    var child, childOffset, width, height, newChild;
    var elt = context[field];

    childContext[field] = null;
    if (elt && selector) {
      child = elt.find(selector).filter(function () {
        var guid = Ember['default'].guidFor(this);
        if (!seen[guid]) {
          seen[guid] = true;
          return true;
        }
      });
      if (child.length > 0) {
        childOffset = child.offset();
        width = child.outerWidth();
        height = child.outerHeight();
        newChild = child.clone();

        // Hide the original element
        child.css({ visibility: 'hidden' });

        // If the original element's parent was hidden, hide our clone
        // too.
        if (elt.css('visibility') === 'hidden') {
          newChild.css({ visibility: 'hidden' });
        }
        newChild.appendTo(elt.parent());
        newChild.outerWidth(width);
        newChild.outerHeight(height);
        var newParentOffset = newChild.offsetParent().offset();
        newChild.css({
          position: 'absolute',
          top: childOffset.top - newParentOffset.top,
          left: childOffset.left - newParentOffset.left,
          margin: 0
        });

        // Pass the clone to the next animation
        childContext[field] = newChild;
        return function cleanup() {
          newChild.remove();
          child.css({ visibility: '' });
        };
      }
    }
  }

  function animationFor(context, piece) {
    var name, args, func;
    if (!piece.use) {
      throw new Error("every argument to the 'explode' animation must include a followup animation to 'use'");
    }
    if (Ember['default'].isArray(piece.use)) {
      name = piece.use[0];
      args = piece.use.slice(1);
    } else {
      name = piece.use;
      args = [];
    }
    if (typeof name === 'function') {
      func = name;
    } else {
      func = context.lookup(name);
    }
    return function () {
      return liquid_fire.Promise.resolve(func.apply(this, args));
    };
  }

  function runAnimation(context, piece) {
    return new liquid_fire.Promise(function (resolve, reject) {
      animationFor(context, piece).apply(context).then(resolve, reject);
    });
  }

  function matchAndExplode(context, piece, seen) {
    if (!context.oldElement || !context.newElement) {
      return liquid_fire.Promise.resolve();
    }

    // reduce the matchBy scope
    if (piece.pick) {
      context.oldElement = context.oldElement.find(piece.pick);
      context.newElement = context.newElement.find(piece.pick);
    }

    if (piece.pickOld) {
      context.oldElement = context.oldElement.find(piece.pickOld);
    }

    if (piece.pickNew) {
      context.newElement = context.newElement.find(piece.pickNew);
    }

    // use the fastest selector available
    var selector;

    if (piece.matchBy === 'id') {
      selector = function (attrValue) {
        return "#" + attrValue;
      };
    } else if (piece.matchBy === 'class') {
      selector = function (attrValue) {
        return "." + attrValue;
      };
    } else {
      selector = function (attrValue) {
        var escapedAttrValue = attrValue.replace(/'/g, "\\'");
        return "[" + piece.matchBy + "='" + escapedAttrValue + "']";
      };
    }

    var hits = Ember['default'].A(context.oldElement.find("[" + piece.matchBy + "]").toArray());
    return liquid_fire.Promise.all(hits.map(function (elt) {
      var attrValue = Ember['default'].$(elt).attr(piece.matchBy);

      // if there is no match for a particular item just skip it
      if (attrValue === "" || context.newElement.find(selector(attrValue)).length === 0) {
        return liquid_fire.Promise.resolve();
      }

      return explodePiece(context, {
        pick: selector(attrValue),
        use: piece.use
      }, seen);
    }));
  }

});
define('lean-green/transitions/fade', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = fade;

  // BEGIN-SNIPPET fade-definition
  function fade() {
    var _this = this;

    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var firstStep;
    var outOpts = opts;
    var fadingElement = findFadingElement(this);

    if (fadingElement) {
      // We still have some older version that is in the process of
      // fading out, so out first step is waiting for it to finish.
      firstStep = liquid_fire.finish(fadingElement, 'fade-out');
    } else {
      if (liquid_fire.isAnimating(this.oldElement, 'fade-in')) {
        // if the previous view is partially faded in, scale its
        // fade-out duration appropriately.
        outOpts = { duration: liquid_fire.timeSpent(this.oldElement, 'fade-in') };
      }
      liquid_fire.stop(this.oldElement);
      firstStep = liquid_fire.animate(this.oldElement, { opacity: 0 }, outOpts, 'fade-out');
    }
    return firstStep.then(function () {
      return liquid_fire.animate(_this.newElement, { opacity: [opts.maxOpacity || 1, 0] }, opts, 'fade-in');
    });
  }

  function findFadingElement(context) {
    for (var i = 0; i < context.older.length; i++) {
      var entry = context.older[i];
      if (liquid_fire.isAnimating(entry.element, 'fade-out')) {
        return entry.element;
      }
    }
    if (liquid_fire.isAnimating(context.oldElement, 'fade-out')) {
      return context.oldElement;
    }
  }
  // END-SNIPPET

});
define('lean-green/transitions/flex-grow', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = flexGrow;
  function flexGrow(opts) {
    liquid_fire.stop(this.oldElement);
    return liquid_fire.Promise.all([liquid_fire.animate(this.oldElement, { 'flex-grow': 0 }, opts), liquid_fire.animate(this.newElement, { 'flex-grow': [1, 0] }, opts)]);
  }

});
define('lean-green/transitions/fly-to', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  exports['default'] = flyTo;
  function flyTo() {
    var _this = this;

    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!this.newElement) {
      return liquid_fire.Promise.resolve();
    } else if (!this.oldElement) {
      this.newElement.css({ visibility: '' });
      return liquid_fire.Promise.resolve();
    }

    var oldOffset = this.oldElement.offset();
    var newOffset = this.newElement.offset();

    if (opts.movingSide === 'new') {
      var motion = {
        translateX: [0, oldOffset.left - newOffset.left],
        translateY: [0, oldOffset.top - newOffset.top],
        outerWidth: [this.newElement.outerWidth(), this.oldElement.outerWidth()],
        outerHeight: [this.newElement.outerHeight(), this.oldElement.outerHeight()]
      };
      this.oldElement.css({ visibility: 'hidden' });
      return liquid_fire.animate(this.newElement, motion, opts);
    } else {
      var motion = {
        translateX: newOffset.left - oldOffset.left,
        translateY: newOffset.top - oldOffset.top,
        outerWidth: this.newElement.outerWidth(),
        outerHeight: this.newElement.outerHeight()
      };
      this.newElement.css({ visibility: 'hidden' });
      return liquid_fire.animate(this.oldElement, motion, opts).then(function () {
        _this.newElement.css({ visibility: '' });
      });
    }
  }

});
define('lean-green/transitions/move-over', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  exports['default'] = moveOver;

  function moveOver(dimension, direction, opts) {
    var _this = this;

    var oldParams = {},
        newParams = {},
        firstStep,
        property,
        measure;

    if (dimension.toLowerCase() === 'x') {
      property = 'translateX';
      measure = 'width';
    } else {
      property = 'translateY';
      measure = 'height';
    }

    if (liquid_fire.isAnimating(this.oldElement, 'moving-in')) {
      firstStep = liquid_fire.finish(this.oldElement, 'moving-in');
    } else {
      liquid_fire.stop(this.oldElement);
      firstStep = liquid_fire.Promise.resolve();
    }

    return firstStep.then(function () {
      var bigger = biggestSize(_this, measure);
      oldParams[property] = bigger * direction + 'px';
      newParams[property] = ["0px", -1 * bigger * direction + 'px'];

      return liquid_fire.Promise.all([liquid_fire.animate(_this.oldElement, oldParams, opts), liquid_fire.animate(_this.newElement, newParams, opts, 'moving-in')]);
    });
  }

  function biggestSize(context, dimension) {
    var sizes = [];
    if (context.newElement) {
      sizes.push(parseInt(context.newElement.css(dimension), 10));
      sizes.push(parseInt(context.newElement.parent().css(dimension), 10));
    }
    if (context.oldElement) {
      sizes.push(parseInt(context.oldElement.css(dimension), 10));
      sizes.push(parseInt(context.oldElement.parent().css(dimension), 10));
    }
    return Math.max.apply(null, sizes);
  }

});
define('lean-green/transitions/scale', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  exports['default'] = scale;
  function scale() {
    var _this = this;

    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return liquid_fire.animate(this.oldElement, { scale: [0.2, 1] }, opts).then(function () {
      return liquid_fire.animate(_this.newElement, { scale: [1, 0.2] }, opts);
    });
  }

});
define('lean-green/transitions/scroll-then', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = function (nextTransitionName, options) {
    for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      rest[_key - 2] = arguments[_key];
    }

    var _this = this;

    Ember['default'].assert("You must provide a transition name as the first argument to scrollThen. Example: this.use('scrollThen', 'toLeft')", 'string' === typeof nextTransitionName);

    var el = document.getElementsByTagName('html');
    var nextTransition = this.lookup(nextTransitionName);
    if (!options) {
      options = {};
    }

    Ember['default'].assert("The second argument to scrollThen is passed to Velocity's scroll function and must be an object", 'object' === typeof options);

    // set scroll options via: this.use('scrollThen', 'ToLeft', {easing: 'spring'})
    options = Ember['default'].merge({ duration: 500, offset: 0 }, options);

    // additional args can be passed through after the scroll options object
    // like so: this.use('scrollThen', 'moveOver', {duration: 100}, 'x', -1);

    return window.$.Velocity(el, 'scroll', options).then(function () {
      nextTransition.apply(_this, rest);
    });
  }

});
define('lean-green/transitions/to-down', ['exports', 'lean-green/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, 'y', 1, opts);
  }

});
define('lean-green/transitions/to-left', ['exports', 'lean-green/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, 'x', -1, opts);
  }

});
define('lean-green/transitions/to-right', ['exports', 'lean-green/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, 'x', 1, opts);
  }

});
define('lean-green/transitions/to-up', ['exports', 'lean-green/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, 'y', -1, opts);
  }

});
define('lean-green/utils/message-priority', ['exports', 'ember-uni-form/utils/message-priority'], function (exports, message_priority) {

	'use strict';



	exports.default = message_priority.default;

});
define('lean-green/utils/pathify', ['exports', 'ember-uni-form/utils/pathify'], function (exports, pathify) {

	'use strict';



	exports.default = pathify.default;

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('lean-green/config/environment', ['ember'], function(Ember) {
  var prefix = 'lean-green';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("lean-green/tests/test-helper");
} else {
  require("lean-green/app")["default"].create({"name":"lean-green","version":"0.0.0+de058d5d"});
}

/* jshint ignore:end */
//# sourceMappingURL=lean-green.map