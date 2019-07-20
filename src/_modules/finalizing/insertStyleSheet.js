export const insertStyleSheet = (styles) => {
    let d = document;
    let style = d.createElement('style');
    style.appendChild(d.createTextNode(""));
    d.getElementsByTagName('head')[0].appendChild(style);
    style.appendChild(d.createTextNode(styles))
};