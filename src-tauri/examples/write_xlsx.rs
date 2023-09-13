use xlsxwriter::prelude::*;

fn main() {
    let workbook = Workbook::new("simple1.xlsx").unwrap();

    let mut sheet1 = workbook.add_worksheet(None).unwrap();
    sheet1.write_string(0, 0, "Red text", Some(&Format::new().set_font_color(FormatColor::Red))).unwrap();
    sheet1.write_number(0, 1, 20., None).unwrap();
    sheet1.write_formula_num(1, 0, "=10+B1", None, 30.).unwrap();
    sheet1.write_url(
        1,
        1,
        "https://github.com/informationsea/xlsxwriter-rs",
        Some(&Format::new().set_font_color(FormatColor::Blue).set_underline(FormatUnderline::Single)),
    ).unwrap();
    sheet1.merge_range(2, 0, 3, 2, "Hello, world", Some(
        &Format::new().set_font_color(FormatColor::Green).set_align(FormatAlignment::CenterAcross)
            .set_vertical_align(FormatVerticalAlignment::VerticalCenter))).unwrap();

    sheet1.set_selection(1, 0, 1, 2);
    sheet1.set_tab_color(FormatColor::Cyan);
    workbook.close().unwrap();

    workbook.open
}
