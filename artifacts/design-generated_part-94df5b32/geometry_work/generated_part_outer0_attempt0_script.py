This represents a standard standoff U-clamp! The pipe goes through the loop, and the loop is at the top (Z=40 to Z=51).
                                   Wait, why does the design plan say `overall_bbox: { xlen: 62.0, ylen: 20.0, zlen: 41.0 }`?
                                   If the design plan says `zlen: 41.0`, let's check if the height of the U-clamp would be 41.0 if the pipe center was 30mm? No, the design plan says `standoff_height_to_pipe_center: 40.0`.
                                   If the standoff height is 40.0, and the inner radius is 10.0, and it's concave down, then the max Z is 51.0.
                                   If it's concave up, the max Z is 40.0 (plus maybe 1.0 for thickness, so 41.0!).
                                   Wait! If it is concave up (cradle), the highest points are the tops of the legs, which are at Z=40. But wait, if the legs go up to Z=40, and the cradle curves *down*, then the legs end at Z=40. If the legs have thickness 1mm, they might end at Z=41?
                                   Actually, let's look at the "Two parallel vertical standoff legs