# Positive-flip case studies

Prompts where the card-augmented (treatment) arm scored above the
no-tools (control) arm, under either the v0.1 or the v0.2-lite
retrieval interface. Code is the exact final candidate each arm
produced, taken verbatim from the run records in `../data/`.

Total positive-flip prompts: **8** of 73.

## allele-frequency-from-genotypes-py

- domain: `biology-population-genetics`  ·  cards: `hardy-weinberg-equilibrium`
- v0.1 delta: **+0.7500** (control 0.0000 → treatment 0.7500)
- v0.2-lite delta: **-0.4500** (control 0.7500 → treatment 0.3000)

**Control (no tools):**

```python
def allele_frequency_A(n_AA, n_Aa, n_aa):
    def check_input(counts):
        if sum(counts) == 0:
            raise ValueError("Total population must be positive")
        for count in counts:
            if count < 0:
                raise ValueError("Counts cannot be negative")

    check_input((n_AA, n_Aa, n_aa))
    
    total = n_AA + n_Aa + n_aa
    count_A = 2 * n_AA + n_Aa
    
    return (2  + 1) / (2 *
```

**Treatment (card-augmented):**

```python
def allele_frequency_A(n_AA, n_Aa, n_aa):
    if n_AA < 0 or n_Aa < 0 or n_aa < 0:
        raise ValueError("Counts must be non-negative")
    if n_AA + n_Aa + n_aa == 0:
        raise ValueError("Total population cannot be zero")
    
    return (2 * n_AA + n_Aa) / (2 * (n_AA + n_Aa + n_aa))
```

## nernst-equation-py

- domain: `chemistry-electrochemistry`  ·  cards: `nernst-equation`
- v0.1 delta: **+0.0000** (control 0.0000 → treatment 0.0000)
- v0.2-lite delta: **+0.7500** (control 0.0000 → treatment 0.7500)

**Control (no tools):**

```python
R = 8.314462618  # J/(mol·K)
F = 96485.33212  # C/mol

def nernst_potential(E_standard, n, T, Q):
    if not isinstance(n, int) or n <= 0:
        raise ValueError("n must be a positive integer")
    if T <= 0:
        raise ValueError("Temperature (T) must be positive")
    if Q <= 0:
        raise ValueError("Reaction quotient (Q) must be positive")
    
    import math
    potential = E_standard - (R * T / (n * F)) * math.log(Q)
    
    return potential
```

**Treatment (card-augmented):**

```python
import math

def nernst_potential(E_standard, n, T, Q):
    if n <= 0:
        raise ValueError("The number of electrons transferred must be a positive integer")
    if T <= 0:
        raise ValueError("The absolute temperature must be a positive value")
    if Q <= 0:
        raise ValueError("The reaction quotient must be greater than zero")

    R = 8.314462618
    F = 96485.33212

    E = E_standard - (R * T / (n * F)) * math.log(Q)

    return E
```

## cauchy-schwarz-ratio-py

- domain: `mathematics-analysis`  ·  cards: `cauchy-schwarz-inequality`
- v0.1 delta: **-0.3500** (control 0.7500 → treatment 0.4000)
- v0.2-lite delta: **+0.3500** (control 0.4000 → treatment 0.7500)

**Control (no tools):**

```python
import numpy as np

def cauchy_schwarz_ratio(u, v):
    u = np.array(u)
    v = np.array(v)
    
    if len(u) != len(v):
        raise ValueError("Vectors have different lengths")
    
    if not(np.any(u == 0)):
        urr = np.linalg.norm(u)
    else:
        raise ValueError("Vector u has zero norm")
        
    if not(np.any(v == 0)):
        vrr = np.linalg.norm(v)
    else:
        raise ValueError("Vector v has zero norm")

    dot_produit = np.dot(u, v) 
    
    ratio = abs(dot_produit / (urr * vrr))
    
    return ratio
```

**Treatment (card-augmented):**

```python
import numpy as np

def cauchy_schwarz_ratio(u, v):
    u = np.atleast_1d(np.array(u))
    v = np.atleast_1d(np.array(v))

    if len(u) != len(v):
        raise ValueError("Vectors must have the same length")

    dot_product = np.dot(u, v)
    norm_u = np.linalg.norm(u)
    norm_v = np.linalg.norm(v)

    if norm_u == 0 or norm_v == 0:
        raise ValueError("Both vectors must be non-zero")

    return abs(dot_product) / (norm_u * norm_v)
```

## vector-triangle-inequality-py

- domain: `mathematics-analysis`  ·  cards: `triangle-inequality`
- v0.1 delta: **+0.7500** (control 0.0000 → treatment 0.7500)
- v0.2-lite delta: **+0.2500** (control 0.0000 → treatment 0.2500)

**Control (no tools):**

```python
import numpy as np

def vector_triangle_holds(u, v):
    if len(u) != len(v):
        raise ValueError('Shape mismatch')
    
    u = np.array(u)
    v = np.array(v)

    left_side = np.linalg.norm(u + v, ord=np.inf)
    right_side = np.linalg.norm(u) + np.linalg.norm(v, ord=np.inf)
    
    if np.isclose(left_side, right_side):
        return True
    else:
        raise ValueError('Not a valid (triangle inequality fails)')
```

**Treatment (card-augmented):**

```python
import numpy as np

def vector_triangle_holds(u, v):
    if len(u) != len(v):
        raise ValueError('u and v must be the same length')
    
    u = np.array(u)
    v = np.array(v)
    
    return np.linalg.norm(u + v, 2) <= (np.linalg.norm(u, 2) + np.linalg.norm(v, 2))
```

## free-fall-trajectory-py

- domain: `physics-classical-mechanics`  ·  cards: `free-fall-uniform-gravity`
- v0.1 delta: **+0.7500** (control 0.0000 → treatment 0.7500)
- v0.2-lite delta: **+0.0000** (control 0.0000 → treatment 0.0000)

**Control (no tools):**

```python
import numpy as np

def trajectory(y0, v0, g, t):
    return y0 + v0 * t - 0.5 * g * t**2
```

**Treatment (card-augmented):**

```python
import numpy as np

def trajectory(y0, v0, g, t):
    return y0 + v0 * np.array(t) - 0.5 * g * (np.array(t))**2
```

## bloch-group-velocity-py

- domain: `physics-condensed-matter`  ·  cards: `bloch-theorem`
- v0.1 delta: **-0.7500** (control 0.7500 → treatment 0.0000)
- v0.2-lite delta: **+0.3750** (control 0.3750 → treatment 0.7500)

**Control (no tools):**

```python
import numpy as np

hbar = 6.626069572661e-34 # m^2 kg s^-1 (from J s)
CONST_HBAR_M2 = hbar / (2 * np.pi) # using h_bar = h/2pi

def tight_binding_group_velocity(t_hopping, a, k):
    if t_hopping <= 0 or a <= 0:
        raise ValueError("t_hopping and a must be positive")
    
    group_velocity = (t_hopping /CONST_HBAR_M2) * np.sin(k*a)
    return group_velocity
```

**Treatment (card-augmented):**

```python
import math
from scipy.constants import hbar

def tight_binding_group_velocity(t_hopping, a, k):
    if t_hopping <= 0 or a <= 0:
        raise ValueError("t_hopping and a must be positive")

    group_vel = (2 * t_hopping * a / hbar) * math.sin(k * a)
    
    return group_vel
```

## fermi-energy-3d-free-electron-py

- domain: `physics-condensed-matter`  ·  cards: `density-of-states`
- v0.1 delta: **+0.0000** (control 0.7500 → treatment 0.7500)
- v0.2-lite delta: **+0.7500** (control 0.0000 → treatment 0.7500)

**Control (no tools):**

```python
import math

def fermi_energy_3d_free_electron(n):
    hbar = 1.054571817e-34 # J*s
    m_e = 9.1093837e-31 # kg
    return (hbar ** 2 / (2 * m_e)) * (math.pi ** 2 * n)**(2/3)
```

**Treatment (card-augmented):**

```python
import numpy as np
from scipy.constants import hbar, m_e, elementary_charge as e

def fermi_energy_3d_free_electron(n):
    if n <= 0:
        raise ValueError("n must be greater than zero")
        
    E_F = (hbar**2 / (2 * m_e)) * (np.pi**2 * 3 * n)**(2/3)
    
    return E_F
```

## continuity-flow-rate-py

- domain: `physics-fluid-dynamics`  ·  cards: `continuity-equation`
- v0.1 delta: **+0.0000** (control 0.7500 → treatment 0.7500)
- v0.2-lite delta: **+0.7500** (control 0.0000 → treatment 0.7500)

**Control (no tools):**

```python
def flow_velocity_after_narrowing(A1, v1, A2):
    if A1 <= 0 or A2 <= 0:
        raise ValueError("Cross-sectional area must be positive")
    return -v1 * (A1/ A2)
```

**Treatment (card-augmented):**

```python
def flow_velocity_after_narrowing(A1, v1, A2):
    if A1 <= 0 or A2 <= 0:
        raise ValueError("A1 and A2 must be positive")

    v2 = (A1 * v1) / A2
    return v2
```

