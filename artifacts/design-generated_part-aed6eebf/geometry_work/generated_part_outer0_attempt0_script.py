_x, blade_half_thickness)
            .threePointArc(
                (top_mid_x, blade_half_thickness + blade_top_sagitta),
                (blade_top_outer_x, blade_half_thickness)
            )
            .lineTo(blade_top_outer_x, -blade_half_thickness)
            .threePointArc(
                (top_mid_x, -blade_half_thickness + blade_top_sagitta),
                (blade_top_inner_x, -blade_half_thickness)
            )
        )

        # Loft to create the blade solid
        single_blade = wp.loft(ruled=False)
        ```
    *   Wait! Is `wp.loft(ruled=False)` going to loft the two wires?
        Yes, because `wp` has two pending wires in its stack (one from the base plane, one from the top plane).
        Let's double-check if `.workplane(offset=hub_height).transformed(...)` correctly separates the pending wires.
        Yes, in CadQuery, whenever you transition to a new workplane (e.g. via `.workplane()`), the drawing operations on the new workplane create a new wire/sketch, and both wires are stored in the Workplane's history/stack. When `.loft()` is called, it lofts all wires currently in the stack.

11. **Testing the Blade rotation and Union**:
    *   We