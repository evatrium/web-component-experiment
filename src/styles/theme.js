export const theme = {
    //backgrounds
    bg_1: '#fff',
    //shades of white
    off_white_1: '#fafcfd',
    off_white_2: '#f2f6fa',
    off_white_3: '#e9f1f7',
    //primaries
    primary_1: '#485be4',
    primary_2: '#4cd0e1',
    primary_3: '#673AB7',
    //prompts
    error: '#ff3058',
    warning: '#ffb231',
    success: '#13caab',
    //z-indexes
    z_index_dropdown: 9900,
    z_index_nav: 7000,
    z_index_overlay: 4000,
    //box shadows
    shadow_1: '0px 2px 13px 1px rgba(150, 160, 229, 0.15)',
    shadow_2: "0px 4px 19px 1px rgba(150, 160, 229, 0.18)",
    shadow_3: "0px 4px 20px 3px rgba(150, 160, 229, 0.19)",
    //cohesive spacing
    spacing: "20px",
    //nav height for adding padding-top to page content if nav exists
    nav_height: "56px",
    //contains the content horizontally
    container_width: "1280px",
    //typography
    font_family: 'Helvetica Neue, -apple-system, Segoe UI, Roboto, sans-serif',
    font_size: '16px',
    font_weight: 500,
    font_color: '#070737',
    font_lighter: '#4a5767',
    line_height: '120%',
    letter_spacing: 'normal',
    text_field_line_height: 22,
    //misc
    border_radius: '10px',
    transition: 'all 300ms cubic-bezier(0.19, 1, 0.22, 1)'
};

export const cvar = (key) => `var(--${key},${theme[key]})`;

export const convertThemeToCssVars = (vars, selector) =>
    `${selector || ':root'}{${Object.keys(vars).map((key) => `--${key}:${vars[key]};`).join('')}}`;

