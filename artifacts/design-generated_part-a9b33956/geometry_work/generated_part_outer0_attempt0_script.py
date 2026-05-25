480.
    If sphere is translated to `480 + 300 - 5 = 775`, then the lowest point of the sphere is at `775 - 300 = 475`.
    This is exactly 5mm below the seat top (Z=480).
    This is correct!

    Let's check the final `result` variable assignment:
    `result = base.union(column).union(seat).union(bracket).union(backrest)`

    Let's verify everything is clean and there are no syntax errors or missing imports.
    `import cadquery as cq` is at the top.
    No visualization calls, no `show()`.
    Only valid CadQuery operations.

    Let's do a quick sanity check on the overall bounding box:
    - Base footprint: 600mm diameter.
    - Column: Z up to 455.
    - Seat: Z up to 480.
    - Bracket: Z up to 500.
    - Backrest: Z from 495 to 495 + 500 * cos(15 deg) = 495 + 483 = 978mm.
    - Y span: From base rear (-300) to backrest rear (approx -228 - 500 * sin(15 deg) = -228 - 12