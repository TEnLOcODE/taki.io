let easeQuad = {
    In: (x) => x**2,
      
    Out: (x) => 1 - (1 - x)**2,
      
    InOut: (x) => x < 0.5 ? (x**2 * 2) : (1 - (1 - x)**2 * 2)
};