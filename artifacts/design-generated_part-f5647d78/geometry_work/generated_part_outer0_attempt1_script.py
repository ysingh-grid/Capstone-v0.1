try:
    shaft = shaft.edges("%Circle").filter(
        lambda e: any(abs(e.Center().x - x_pos) < 1.0 for x_pos in [100.0, 180.0, 1120.0, 1200.0])
    ).fillet(2.0)
except Exception:
    try:
        shaft = shaft.edges("%Circle").filter(
            lambda e: any(abs(e.Center().x - x_pos) < 1.0 for x_pos in [100.0, 180.0, 1120.0, 1200.0])
        ).fillet(1.0)
    except Exception:
        pass