import {type Ref, ref} from "vue";
import less from "less";

const css_source_text = ref(`
a {color: red;
    span {color: green;}
}
.circle-a {fill: red; stroke: black; stroke-width: 2px;}
.circle-b {fill: blue; stroke: white; stroke-width: 1px;}
rect.back {fill: pink;}
`);
const parsed_text = ref("");

type CssRuleTree = Record<string, Record<string, string>>;

const parse_css = (css: string): CssRuleTree => {
    const rules: CssRuleTree = {};
    const blocks: string[] = css.split('}');
    for (let i: number = 0; i < blocks.length; i++) {

        let rule: Record<string, string> = {};
        let lines: string[] = blocks[i].split('\n');
        let selector: string
        for (let j = 0; j < lines.length; j++) {
            selector = lines.shift().replace(/^\n/, '').replace(/\{/, '').trim();
            if (selector) {
                break;
            }
        }

        if (selector) {
            for (let j = 0; j < lines.length; j++) {
                let [prop_name, value] = lines[j].split(':');
                prop_name = (prop_name || '').trim();
                value = (value || '').trim();
                if (prop_name && value) {
                    rule[prop_name] = value.replace(/;$/, '');
                }
            }
            rules[selector] = rule;
        }
    }
    return rules;
};

const useApply = (svg_element: SVGSVGElement, css_source_text: string, next: (dataUrl: string) => void) => {
    const css_text: string = `
a {color: red;
    span {color: green;}
}
.circle-a {fill: red; stroke: black; stroke-width: 2px;}
.circle-b {fill: blue; stroke: white; stroke-width: 1px;}
rect.back {fill: pink;}
`

    less.render(css_text).then(({css}: { css: string }) => {
        parsed_text.value = css;

        const my_style_element = document.getElementById('my-style-element');
        if (my_style_element) {
            my_style_element.textContent = css;
        } else {
            const mse = document.createElement("style");
            mse.setAttribute('id', 'my-style-element');
            mse.textContent = css;
            document.head.appendChild(mse);
        }

        const cssRules: CssRuleTree = parse_css(css);

        const svg_source = svg_element.value.outerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg_source, 'image/svg+xml');

        // @ts-ignore
        const cloned_svg_element: SVGSVGElement = <SVGSVGElement>doc.documentElement;
        cloned_svg_element.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        cloned_svg_element.querySelectorAll('*').forEach((element) => {
            for (const selector in cssRules) {
                if (element.matches(selector)) {
                    const properties = cssRules[selector];
                    for (const [property, value] of Object.entries(properties)) {
                        element.setAttribute(property, <string>value);
                    }
                }
            }
        });

        render_as_bmp(cloned_svg_element, next);
    }, (error: Error) => {
        console.error(error);
    });
}

const render_as_bmp = (svg_element: SVGSVGElement, next: (dataUrl: string) => void): string => {
    let svg_str = '<?xml version="1.0" encoding="utf-8"?>' + new XMLSerializer().serializeToString(svg_element);
    // svg_str = `<?xml version="1.0" encoding="utf-8"?><svg data-v-7846674e="" width="800" height="480" viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><circle cx="281" cy="266" r="50" fill="red"/><circle cx="67" cy="124" r="50" fill="red"/><circle cx="262" cy="74" r="50" fill="red"/><circle cx="533" cy="122" r="50" fill="red"/></svg>`
    svg_str = svg_str.replace(/ xmlns=""/g, '');
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        next(canvas.toDataURL('image/png'));
    };

    img.onerror = (e) => {
        console.error(e);
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svg_str);
}

const useDataUrlToBlob = (dataUrl: string): Blob => {
    let binaryString = atob(dataUrl.split(',')[1]);
    let len = binaryString.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    let blob = new Blob([bytes.buffer], {type: "image/png"});
    let url = URL.createObjectURL(blob);
    return blob;
    // return url;
    // let a = document.createElement('a');
    // a.style.display = 'none';
    // a.href = url;
    // a.download = 'image.png';
    // document.body.appendChild(a);
    // a.click();
}

export {useApply, useDataUrlToBlob}