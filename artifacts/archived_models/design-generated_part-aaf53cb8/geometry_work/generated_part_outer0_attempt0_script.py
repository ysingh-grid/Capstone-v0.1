If right is centered at -74, offset should be `-74 - 6 = -80`. Extrude 12 brings it to -68.
            Perfect!

    *   **Chain Stays (CS)**:
        *   "tapered tubes connecting the bottom bracket to the rear dropouts, with a diameter of 20mm at the dropout."
        *   Let's connect the BB to the dropouts.
        *   BB ends are at Y = +36.5 and Y = -36.5. Center is (-435, 0, -300).
        *   Let's start the chainstays at the BB: say at (-435, 30, -300) and (-435, -30, -300).
        *   And end them at the dropouts: say at (-25, 74, -5) and (-25, -74, -5) (which is on the dropout plate).
        *   Diameter at BB: let's use 30mm.
        *   Diameter at dropout: 20mm.
        *   Let's build left and right chainstays using loft!
        ```python
        # Left Chain Stay
        cs_start_l = (-435.0, 30.0, -300.0)
        cs_end_l = (-25.0,