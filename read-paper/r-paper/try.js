
import fuzzysort from 'fuzzysort';


const text =`The partial derivatives of the parametrization are given by
∂θp F
lin(θ) = 1
√
P
f
(p)
.
Optimizing the cost C ◦ F
lin through gradient descent, the parameters follow the ODE:
∂tθp(t) = −∂θp
(C ◦ F
lin)(θ(t)) = −
1
√
P
∂
in
f C|f
lin
θ(t)
f
(p) = −
1
√
P
D
d|f
lin
θ(t)
, f(p)
E
pin
.
As a result the function f
lin
θ(t)
evolves according to
∂tf
lin
θ(t) =
1
√
P
X
P
p=1
∂tθp(t)f
(p) = −
1
P
X
P
p=1
D
d|f
lin
θ(t)
, f(p)
E
pin
f
(p)
,
where the right-hand side is equal to the kernel gradient −∇K˜ C with respect to the tangent kernel
K˜ =
X
P
p=1
∂θp F
lin(θ) ⊗ ∂θp F
lin(θ) = 1
P
X
P
p=1
f
(p) ⊗ f
(p)
.
This is a random nL-dimensional kernel with values K˜
ii0 (x, x0
) = 1
P
PP
p=1 f
(p)
i
(x)f
(p)
i
0 (x
0
).
Performing gradient descent on the cost C ◦F
lin is therefore equivalent to performing kernel gradient
descent with the tangent kernel K˜ in the function space. In the limit as P → ∞, by the law of large
numbers, the (random) tangent kernel K˜ tends to the fixed kernel K, which makes this method an
approximation of kernel gradient descent with respect to the limiting kernel K.`


const testText = `As a result the functionf lin θ(t) evolves according to ∂ t f lin θ(t) = 1 √ P P ∑ p=1 ∂ t θ p (t)f (p) =− 1 P P ∑ p=1 〈 d| f lin θ(t) ,f (p) 〉 p in f (p) , where the right-hand side is equal to the kernel gradient−∇ ̃ K Cwith respect to thetangent kernel ̃ K= P ∑ p=1 ∂ θ p F lin (θ)⊗∂ θ p F lin (θ) = 1 P P ∑ p=1 f (p) ⊗f (p) .`
        

function normalizeMath(text) {
  return text
    .replace(/\s+/g, ' ')                       // collapse whitespace
    .replace(/[∑Σ]/g, 'sum')                   // unify summation symbols
    .replace(/[⟨⟩]/g, '')                      // remove inner product symbols
    .replace(/[−–—]/g, '-')                    // normalize dashes
    .replace(/[∂]/g, 'd')                      // replace partial derivative
    .replace(/[√]/g, 'sqrt')                   // normalize square root
    .replace(/θ/g, 'theta')                    // unify Greek symbols
    .replace(/[^\w\s]/g, '')                   // strip other symbols
    .trim()
    .toLowerCase()
}

const mixedText3 = `
This paper introduces the Neural Tangent Kernel (NTK) to analyze the training dynamics of Artificial Neural Networks (ANNs) in the infinite-width limit. Key concepts and findings include:

- **Equivalence to Kernel Methods** [0, 23, 1, 28]: ANNs at initialization are related to Gaussian processes and kernel methods. During training with gradient descent, the network function \( f_\theta \) follows the kernel gradient of the functional cost with respect to the NTK.
- **Constant NTK in the Infinite-Width Limit** [4, 5, 88]: The NTK converges to a constant limiting kernel in the infinite-width limit, enabling the study of ANN training in function space.
- **Convergence and Positive-Definiteness** [6, 7, 30, 113, 114, 115, 118]: Convergence of training is linked to the positive-definiteness of the limiting NTK, which is proven for data on a sphere with non-polynomial nonlinearity.
- **Linear Differential Equation** [8, 32, 122]: For least-squares regression, the network function \( f_\theta \) follows a linear differential equation in the infinite-width limit, with convergence being fastest along the largest kernel principal components, motivating early stopping [9, 33, 130, 131, 132]. The solution to the differential equation is:
  \\( \\partial_t f_t = \\Phi_K(\\langle f^* - f, \\cdot \\rangle_{p_{in}}) \\) which is expressed as \( f_t = f^* + e^{-t\Pi}(f_0 - f^*) \) using the map \( \Pi : f \rightarrow \Phi_K(\langle f, \cdot \rangle_{p_{in}}) \) [123].
- **Numerical Investigation** [10, 34, 35, 138, 139, 140, 142, 143, 144, 153, 154, 156, 157, 158, 159, 160, 161, 162, 163, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183]: Numerical experiments demonstrate that wide ANNs behave close to the theoretical limit on artificial and MNIST datasets.

The study focuses on fully-connected ANNs with specific initialization and nonlinearity conditions [36, 39, 44, 39]. The training process optimizes \( f_\theta \) in function space \( \mathcal{F} \) with respect to a functional cost \( \mathcal{C} \), facilitated by the NTK [53, 56].

In the context of kernel gradient descent, a cost functional \( C \) depends on the values of \( f \) at data points [65]. A time-dependent function \( f(t) \) follows kernel gradient descent with respect to \( K \) if it satisfies \( \partial_t f(t) = -\nabla_K C|_{f(t)} \) [70].

A kernel \( K \) can be approximated by sampling random functions [75]. Optimizing \( C \circ F_{\text{lin}} \) via gradient descent yields the ODE \( \partial_t \theta_p(t) = -\partial_{\theta_p} (C \circ F_{\text{lin}})(\theta(t)) = -\frac{1}{\sqrt{P}} \partial_{\text{inf}} C|_{f_{\text{lin}} \theta(t)} f^{(p)} = -\frac{1}{\sqrt{P}} \langle d|_{f_{\text{lin}} \theta(t)}, f^{(p)} \rangle_{p_{\text{in}}} \) [78].

For ANNs trained with gradient descent, the network function \( f_\theta \) evolves along the kernel gradient with respect to the NTK \( \Theta^{(L)}(\theta) = \sum_{p=1}^P \partial_{\theta_p} F^{(L)}(\theta) \otimes \partial_{\theta_p} F^{(L)}(\theta) \) [84]. In the infinite-width limit, the NTK becomes deterministic at initialization and remains constant during training [88].

The NTK \( \Theta^{(L)} \) converges in probability to a deterministic limiting kernel \( \Theta^{(L)}_\infty \otimes \text{Id}_{n_L} \) [97]. During training, \( \Theta^{(L)}(t) \rightarrow \Theta^{(L)}_\infty \otimes \text{Id}_{n_L} \) uniformly [109].

For a finite dataset, the map \( \Pi \) has at most \( Nn_L \) positive eigenfunctions, which are the kernel principal components of the data with respect to the kernel \( K \) [127]. Decomposing the difference \( (f^* - f_0) = \Delta_0 f + \Delta_1 f + \dots + \Delta_{Nn_L} f \) along the eigenspaces of \( \Pi \), the trajectory of \( f_t \) is \( f_t = f^* + \Delta_0 f + \sum_{i=1}^{Nn_L} e^{-t\lambda_i} \Delta_i f \) [129].

Assuming the kernel is positive definite on the data, as \( t \rightarrow \infty \), \( f_{\infty} = f^* + \Delta_0 f = f_0 - \sum_i \Delta_i f \) takes the form \( f_{\infty, k}(x) = \kappa_{x,k}^T \tilde{K}^{-1} y^* + (f_0(x) - \kappa_{x,k}^T \tilde{K}^{-1} y_0) \) [134].

Numerical experiments compare fully connected ANNs of various widths to the theoretical infinite-width limit, using ReLU nonlinearity [138, 139]. The NTK shows less variance and is smoother for the wider network [154]. For a regression cost, the infinite-width limit network function \( f_{\theta(t)} \) has a Gaussian distribution for all times \( t \) [158].

The NTK is a tool to study ANNs by describing their local dynamics during gradient descent [185]. This connection provides insights into the generalization properties of ANNs and allows for studying the impact of depth and nonlinearity on a network's learning capabilities [188].

`
;



// To get the escaped version:
const escapedText = escapeBackslashes(mixedText3);
console.log(escapedText);
