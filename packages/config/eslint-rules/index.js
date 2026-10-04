/**
 * Aurora styling guardrails. Each rule bans one way of styling outside
 * @growthtrace/design-system. Allowlists live in eslint.config.js (not in
 * eslint-disable comments, which are blocked), so every exception goes through review.
 */

/** Calls `check(text, node)` for every string literal and template-literal chunk. */
function visitStrings(check) {
  return {
    Literal(node) {
      if (typeof node.value !== 'string') return;
      // Module specifiers are paths, not class lists.
      const parent = node.parent;
      if (
        parent &&
        (parent.type === 'ImportDeclaration' ||
          parent.type === 'ExportNamedDeclaration' ||
          parent.type === 'ExportAllDeclaration' ||
          parent.type === 'ImportExpression')
      ) {
        return;
      }
      check(node.value, node);
    },
    TemplateElement(node) {
      check(node.value.cooked ?? node.value.raw, node);
    },
  };
}

/** Splits a class token into its variants and the utility, ignoring `:` inside brackets. */
function utilityOf(token) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) start = i + 1;
  }
  return { variants: token.slice(0, start), utility: token.slice(start).replace(/^!|!$/g, '') };
}

const ARBITRARY_VALUE = /-\[[^\]]*\]|-\(--[^)]*\)/; // w-[37px], bg-[#f00], p-(--x)
const ARBITRARY_PROPERTY = /^\[[a-z-]+:[^\]]+\]$/; // [mask-type:alpha]
const ARBITRARY_MODIFIER = /\/[[(]/; // bg-accent-from/[0.37]
const ARBITRARY_VARIANT = /(^|:)\[[^\]]*\]:/; // [&>svg]:size-4

const noArbitraryValues = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban Tailwind arbitrary values, properties, modifiers and variants' },
    messages: {
      arbitrary:
        '"{{token}}" is an arbitrary Tailwind value. Add a token to @growthtrace/design-system instead.',
    },
    schema: [],
  },
  create(context) {
    return visitStrings((text, node) => {
      for (const token of text.split(/\s+/)) {
        if (!token.includes('[') && !token.includes('(')) continue;
        const { variants, utility } = utilityOf(token);
        if (
          ARBITRARY_VALUE.test(utility) ||
          ARBITRARY_PROPERTY.test(utility) ||
          ARBITRARY_MODIFIER.test(utility) ||
          ARBITRARY_VARIANT.test(
            variants.replace(/(^|:)(group-|peer-)?(data|aria)-\[[^\]]*\]:/g, '$1'),
          )
        ) {
          context.report({ node, messageId: 'arbitrary', data: { token } });
        }
      }
    });
  },
};

const noBareZIndex = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban numeric z-index classes; use the named z-* layers' },
    messages: {
      bare: '"{{token}}" is a bare z-index. Use a named layer (z-base, z-raised, z-nav, z-overlay, z-dialog, z-toast, z-tooltip).',
    },
    schema: [],
  },
  create(context) {
    return visitStrings((text, node) => {
      for (const token of text.split(/\s+/)) {
        if (/^-?z-\d+$/.test(utilityOf(token).utility)) {
          context.report({ node, messageId: 'bare', data: { token } });
        }
      }
    });
  },
};

const noOffScaleOpacity = {
  meta: {
    type: 'problem',
    docs: { description: 'Allow only the Aurora opacity steps for opacity-* and colour modifiers' },
    messages: {
      offScale:
        '"{{token}}" uses opacity {{value}}, which is not an Aurora step ({{steps}}). Use a step or add a token.',
    },
    schema: [
      {
        type: 'object',
        properties: { steps: { type: 'array', items: { type: 'string' } } },
        required: ['steps'],
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const steps = new Set(context.options[0].steps);
    const list = [...steps].join(', ');
    return visitStrings((text, node) => {
      for (const token of text.split(/\s+/)) {
        const { utility } = utilityOf(token);
        // `opacity-37`, or a colour modifier like `bg-surface/37`. Fractions (`w-1/2`) have a
        // digit before the slash, so they don't match.
        const value =
          /^opacity-(\d+)$/.exec(utility)?.[1] ??
          /^-?[a-z][a-z0-9-]*[a-z]\/(\d+)$/.exec(utility)?.[1];
        if (value !== undefined && !steps.has(value)) {
          context.report({ node, messageId: 'offScale', data: { token, value, steps: list } });
        }
      }
    });
  },
};

const RAW_COLOR =
  /(?:^|[^\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color-mix)\(/i;

const noRawColors = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban raw colour strings; use Aurora colour tokens' },
    messages: {
      raw: 'Raw colour "{{value}}". Use an Aurora colour token (a class, or `tokens.color` from @growthtrace/design-system/tokens).',
    },
    schema: [],
  },
  create(context) {
    return visitStrings((text, node) => {
      const match = RAW_COLOR.exec(text);
      if (match) context.report({ node, messageId: 'raw', data: { value: match[0].trim() } });
    });
  },
};

const noStyleProp = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban the style JSX prop' },
    messages: {
      style: 'Do not use the `style` prop. Use Aurora token classes or a design-system component.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'style') {
          context.report({ node, messageId: 'style' });
        }
      },
    };
  },
};

const STYLESHEET = /\.(?:css|scss|sass|less)(?:\?.*)?$/;

const noCssImports = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban stylesheet imports outside the design system' },
    messages: {
      css: 'Do not import stylesheets ("{{source}}"). All styling comes from @growthtrace/design-system.',
    },
    schema: [
      {
        type: 'object',
        properties: { allow: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const allow = new Set(context.options[0]?.allow ?? []);
    const check = (source, node) => {
      if (typeof source === 'string' && STYLESHEET.test(source) && !allow.has(source)) {
        context.report({ node, messageId: 'css', data: { source } });
      }
    };
    return {
      ImportDeclaration(node) {
        check(node.source.value, node);
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal') check(node.source.value, node);
      },
      'CallExpression[callee.name="require"]'(node) {
        const [arg] = node.arguments;
        if (arg?.type === 'Literal') check(arg.value, node);
      },
    };
  },
};

const MOTION_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
]);

const noInlineMotion = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban inline Motion objects; use the presets in the design system' },
    messages: {
      inline:
        'Inline `{{prop}}` object. Use a preset from @growthtrace/design-system (motion/presets) instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          MOTION_PROPS.has(node.name.name) &&
          node.value?.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'ObjectExpression'
        ) {
          context.report({ node, messageId: 'inline', data: { prop: node.name.name } });
        }
      },
    };
  },
};

export default {
  meta: { name: 'eslint-plugin-aurora' },
  rules: {
    'no-arbitrary-values': noArbitraryValues,
    'no-bare-z-index': noBareZIndex,
    'no-off-scale-opacity': noOffScaleOpacity,
    'no-raw-colors': noRawColors,
    'no-style-prop': noStyleProp,
    'no-css-imports': noCssImports,
    'no-inline-motion': noInlineMotion,
  },
};
