"use strict";
// IR factory functions — use these instead of raw object literals
// to ensure every node always has the required BaseNode fields.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetIdCounter = resetIdCounter;
exports.makeVStack = makeVStack;
exports.makeHStack = makeHStack;
exports.makeZStack = makeZStack;
exports.makeText = makeText;
exports.makeButton = makeButton;
exports.makeImage = makeImage;
exports.makeSpacer = makeSpacer;
exports.makeDivider = makeDivider;
exports.makeScrollView = makeScrollView;
exports.makeNavigationStack = makeNavigationStack;
exports.makeNavigationLink = makeNavigationLink;
exports.makeList = makeList;
exports.makeForEach = makeForEach;
exports.makeSection = makeSection;
exports.makeForm = makeForm;
exports.makeGroup = makeGroup;
exports.makeTextField = makeTextField;
exports.makeSecureField = makeSecureField;
exports.makeToggle = makeToggle;
exports.makePicker = makePicker;
exports.makeSlider = makeSlider;
exports.makeStepper = makeStepper;
exports.makeDatePicker = makeDatePicker;
exports.makeRectangle = makeRectangle;
exports.makeCircle = makeCircle;
exports.makeCapsule = makeCapsule;
exports.makeRoundedRectangle = makeRoundedRectangle;
exports.makeEllipse = makeEllipse;
exports.makeTabView = makeTabView;
exports.makeCustomView = makeCustomView;
exports.makeUnknown = makeUnknown;
var _nextId = 0;
function nextId() {
    return "node_".concat((_nextId++).toString(36));
}
function resetIdCounter() {
    _nextId = 0;
}
function base(modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return { modifiers: modifiers, id: nextId() };
}
function makeVStack(alignment, spacing, children, modifiers) {
    if (alignment === void 0) { alignment = "center"; }
    if (spacing === void 0) { spacing = null; }
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "VStack", alignment: alignment, spacing: spacing, children: children }, base(modifiers));
}
function makeHStack(alignment, spacing, children, modifiers) {
    if (alignment === void 0) { alignment = "center"; }
    if (spacing === void 0) { spacing = null; }
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "HStack", alignment: alignment, spacing: spacing, children: children }, base(modifiers));
}
function makeZStack(alignment, children, modifiers) {
    if (alignment === void 0) { alignment = "center"; }
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "ZStack", alignment: alignment, children: children }, base(modifiers));
}
function makeText(content, isDynamic, modifiers) {
    if (isDynamic === void 0) { isDynamic = false; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Text", content: content, isDynamic: isDynamic }, base(modifiers));
}
function makeButton(label, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Button", label: label, role: null }, base(modifiers));
}
function makeImage(source, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Image", source: source, isResizable: false, contentMode: null }, base(modifiers));
}
function makeSpacer(minLength, modifiers) {
    if (minLength === void 0) { minLength = null; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Spacer", minLength: minLength }, base(modifiers));
}
function makeDivider(modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Divider" }, base(modifiers));
}
function makeScrollView(child, axes, modifiers) {
    if (axes === void 0) { axes = "vertical"; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "ScrollView", axes: axes, showsIndicators: true, child: child }, base(modifiers));
}
function makeNavigationStack(child, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "NavigationStack", child: child }, base(modifiers));
}
function makeNavigationLink(label, destination, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "NavigationLink", label: label, destination: destination }, base(modifiers));
}
function makeList(children, modifiers) {
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "List", children: children }, base(modifiers));
}
function makeForEach(isStatic, staticItems, stubChild, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign(__assign(__assign({ kind: "ForEach", isStatic: isStatic }, (staticItems !== undefined && { staticItems: staticItems })), (stubChild !== undefined && { stubChild: stubChild })), base(modifiers));
}
function makeSection(children, header, footer, modifiers) {
    if (header === void 0) { header = null; }
    if (footer === void 0) { footer = null; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Section", header: header, footer: footer, children: children }, base(modifiers));
}
function makeForm(children, modifiers) {
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Form", children: children }, base(modifiers));
}
function makeGroup(children, modifiers) {
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Group", children: children }, base(modifiers));
}
function makeTextField(label, placeholder, style, modifiers) {
    if (placeholder === void 0) { placeholder = ""; }
    if (style === void 0) { style = "roundedBorder"; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "TextField", label: label, placeholder: placeholder, style: style }, base(modifiers));
}
function makeSecureField(label, placeholder, modifiers) {
    if (placeholder === void 0) { placeholder = ""; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "SecureField", label: label, placeholder: placeholder }, base(modifiers));
}
function makeToggle(label, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Toggle", label: label, isOn: false /* STUB: false */ }, base(modifiers));
}
function makePicker(label, style, children, modifiers) {
    if (style === void 0) { style = "menu"; }
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Picker", label: label, style: style, children: children }, base(modifiers));
}
function makeSlider(minimum, maximum, modifiers) {
    if (minimum === void 0) { minimum = 0; }
    if (maximum === void 0) { maximum = 1; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Slider", value: (minimum + maximum) / 2, // STUB: midpoint
        minimum: minimum, maximum: maximum, step: null }, base(modifiers));
}
function makeStepper(label, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Stepper", label: label, value: 0 /* STUB: 0 */ }, base(modifiers));
}
function makeDatePicker(label, modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "DatePicker", label: label, displayedComponents: ["date"] }, base(modifiers));
}
function makeRectangle(modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Rectangle" }, base(modifiers));
}
function makeCircle(modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Circle" }, base(modifiers));
}
function makeCapsule(modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Capsule" }, base(modifiers));
}
function makeRoundedRectangle(cornerRadius, style, modifiers) {
    if (style === void 0) { style = "continuous"; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "RoundedRectangle", cornerRadius: cornerRadius, style: style }, base(modifiers));
}
function makeEllipse(modifiers) {
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "Ellipse" }, base(modifiers));
}
function makeTabView(children, modifiers) {
    if (children === void 0) { children = []; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "TabView", children: children }, base(modifiers));
}
function makeCustomView(name, args, modifiers) {
    if (args === void 0) { args = {}; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "CustomViewNode", name: name, args: args }, base(modifiers));
}
function makeUnknown(rawType, rawSource, modifiers) {
    if (rawSource === void 0) { rawSource = ""; }
    if (modifiers === void 0) { modifiers = []; }
    return __assign({ kind: "UnknownNode", rawType: rawType, rawSource: rawSource }, base(modifiers));
}
