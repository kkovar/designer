/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

define('polymer-designer/commands/DomCommandApplier', [
      'polymer-designer/commands/CommandApplier',
      'polymer-designer/dom-utils',
      'polymer-designer/path',
      'polymer-designer/commands'],
    function(CommandApplier, domUtils, pathLib, commands) {

  var getNodeFromPath = function(path, doc) {
    return pathLib.getNodeFromPath(path, doc, domUtils.designerNodeFilter);
  }

  var commandHandlers = {
    'setAttribute': {
      canApply: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        return node.getAttribute(command.attribute) === command.oldValue;
      },

      apply: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        node.setAttribute(command.attribute, command.newValue);
      },

      canUndo: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        return node.getAttribute(command.attribute) === command.newValue;
      },

      undo: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        node.setAttribute(command.attribute, command.oldValue);
      },
    },

    'setTextContent': {
      canApply: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        if (!node) return false;
        var hasElementChildren = node.children === 0;
        if (hasElementChildren) {
          console.warn(
              'Not applying', command,
              'because target node', node, 'has element children');
        }
        return !hasElementChildren;
      },

      apply: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        node.textContent = command.newValue;
      },

      canUndo: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        return node.textContent === command.newValue;
      },

      undo: function(doc, nodes, command) {
        var node = nodes.get(command.nodeId);
        node.textContent = command.oldValue;
      },
    },

    'moveElement': {
      canApply: function(doc, nodes, command) {
        var el = nodes.get(command.nodeId);
        var target = nodes.get(command.targetNodeId);
        return el != null && target != null &&
            (command.position == commands.InsertPosition.before ||
             command.position == commands.InsertPosition.after);
      },

      apply: function(doc, nodes, command) {
        var el = nodes.get(command.nodeId);
        var target = nodes.get(command.targetNodeId);
        var container = target.parentNode;
        if (command.position == commands.InsertPosition.before) {
          container.insertBefore(el, target);
        } else if (command.position == commands.InsertPosition.after) {
          target = target.nextSibling;
          container.insertBefore(el, target);
        }
      },

      canUndo: function(doc, nodes, command) {
        return false;
      },
    },
  };

  /**
   * Applies commands to DOM Documents, including embedded and linked
   * stylesheets.
   */
  function DomCommandApplier(doc, nodes) {
    CommandApplier.call(this, doc, nodes);
    this.handlers = commandHandlers;
  }
  DomCommandApplier.prototype = Object.create(CommandApplier.prototype);
  DomCommandApplier.prototype.constructor = DomCommandApplier;

  // exports
  return DomCommandApplier;
});
