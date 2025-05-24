export const labeledChunks = {
    "0": {
        "passages": [
            "Neural Tangent Kernel:\nConvergence and Generalization in Neural Networks\nArthur Jacot\n ́\nEcole Polytechnique F\n ́\ned\n ́\nerale de Lausanne\narthur.jacot@netopera.net\nFranck Gabriel\nImperial College London and\n ́\nEcole Polytechnique F\n ́\ned\n ́\nerale de Lausanne\nfranckrgabriel@gmail.com\nCl\n ́\nement Hongler\n ́\nEcole Polytechnique F\n ́\ned\n ́\nerale de Lausanne\nclement.hongler@gmail.com\nAbstract\nAt initialization, artificial neural networks (ANNs) are equivalent to Gaussian\nprocesses in the infinite-width limit (16;4;7;13;6), thus connecting them to\nkernel methods. [0]\n",
            "We prove that the evolution of an ANN during training can also\nbe described by a kernel: during gradient descent on the parameters of an ANN,\nthe network functionf\nθ\n(which maps input vectors to output vectors) follows the\nkernel gradient of the functional cost (which is convex, in contrast to the parameter\ncost) w.r.t. [1]\n",
            "a new kernel: the Neural Tangent Kernel (NTK). [2]\n",
            "This kernel is central\nto describe the generalization features of ANNs. [3]\n",
            "While the NTK is random at\ninitialization and varies during training, in the infinite-width limit it converges\nto an explicit limiting kernel and it stays constant during training. [4]\n",
            "This makes it\npossible to study the training of ANNs in function space instead of parameter space. [5]\n",
            "Convergence of the training can then be related to the positive-definiteness of the\nlimiting NTK. [6]\n",
            "We prove the positive-definiteness of the limiting NTK when the\ndata is supported on the sphere and the non-linearity is non-polynomial. [7]\n",
            "We then focus on the setting of least-squares regression and show that in the infinite-\nwidth limit, the network functionf\nθ\nfollows a linear differential equation during\ntraining. [8]\n",
            "The convergence is fastest along the largest kernel principal components\nof the input data with respect to the NTK, hence suggesting a theoretical motivation\nfor early stopping. [9]\n",
            "Finally we study the NTK numerically, observe its behavior for wide networks,\nand compare it to the infinite-width limit. [10]\n",
            "1    Introduction\nArtificial neural networks (ANNs) have achieved impressive results in numerous areas of machine\nlearning. [11]\n",
            "While it has long been known that ANNs can approximate any function with sufficiently\nmany hidden neurons (11;14), it is not known what the optimization of ANNs converges to. [12]\n",
            "Indeed\nthe loss surface of neural networks optimization problems is highly non-convex: it has a high number\nof saddle points which may slow down the convergence (5). [13]\n",
            "A number of results (3;17;18) suggest\nthat for wide enough networks, there are very few “bad” local minima, i.e. [14]\n",
            "local minima with much\n32nd Conference on Neural Information Processing Systems (NIPS 2018), Montr\n ́\neal, Canada. [15]\n",
            "arXiv:1806.07572v4  [cs.LG]  10 Feb 2020higher cost than the global minimum. [16]\n",
            "More recently, the investigation of the geometry of the loss\nlandscape at initialization has been the subject of a precise study (12). [17]\n",
            "The analysis of the dynamics\nof training in the large-width limit for shallow networks has seen recent progress as well (15). [18]\n",
            "To\nthe best of the authors knowledge, the dynamics of deep networks has however remained an open\nproblem until the present paper: see the contributions section below. [19]\n",
            "A particularly mysterious feature of ANNs is their good generalization properties in spite of their\nusual over-parametrization (20). [20]\n",
            "It seems paradoxical that a reasonably large neural network can fit\nrandom labels, while still obtaining good test accuracy when trained on real data (23). [21]\n",
            "It can be noted\nthat in this case, kernel methods have the same properties (1). [22]\n",
            "In the infinite-width limit, ANNs have a Gaussian distribution described by a kernel (16;4;7;13;6). [23]\n",
            "These kernels are used in Bayesian inference or Support Vector Machines, yielding results comparable\nto ANNs trained with gradient descent (2;13). [24]\n",
            "We will see that in the same limit, the behavior of\nANNs during training is described by a related kernel, which we call the neural tangent network\n(NTK). [25]\n",
            "1.1    Contribution\nWe study the network functionf\nθ\nof an ANN, which maps an input vector to an output vector, where\nθis the vector of the parameters of the ANN. [26]\n",
            "In the limit as the widths of the hidden layers tend to\ninfinity, the network function at initialization,f\nθ\nconverges to a Gaussian distribution (16;4;7;13;6). [27]\n",
            "In this paper, we investigate fully connected networks in this infinite-width limit, and describe the\ndynamics of the network functionf\nθ\nduring training:\n•During gradient descent, we show that the dynamics off\nθ\nfollows that of the so-calledkernel\ngradient descentin function space with respect to a limiting kernel, which only depends on\nthe depth of the network, the choice of nonlinearity and the initialization variance. [28]\n",
            "•The convergence properties of ANNs during training can then be related to the positive-\ndefiniteness of the infinite-width limit NTK. [29]\n",
            "In the case when the dataset is supported on a\nsphere, we prove this positive-definiteness using recent results on dual activation functions\n(4). [30]\n",
            "The values of the network functionf\nθ\noutside the training set is described by the NTK,\nwhich is crucial to understand how ANN generalize. [31]\n",
            "•\nFor a least-squares regression loss, the network functionf\nθ\nfollows a linear differential\nequation in the infinite-width limit, and the eigenfunctions of the Jacobian are the kernel\nprincipal components of the input data. [32]\n",
            "This shows a direct connection to kernel methods\nand motivates the use of early stopping to reduce overfitting in the training of ANNs. [33]\n",
            "•Finally we investigate these theoretical results numerically for an artificial dataset (of points\non the unit circle) and for the MNIST dataset. [34]\n",
            "In particular we observe that the behavior of\nwide ANNs is close to the theoretical limit. [35]\n",
            "2    Neural networks\nIn this article, we consider fully-connected ANNs with layers numbered from0(input) toL(output),\neach containingn\n0\n,...,n\nL\nneurons, and with a Lipschitz, twice differentiable nonlinearity function\nσ:R→R, with bounded second derivative\n1\n. [36]\n",
            "This paper focuses on the ANNrealization functionF\n(L)\n:R\nP\n→ F, mapping parametersθto\nfunctionsf\nθ\nin a spaceF. [37]\n",
            "The dimension of the parameter space isP=\n∑\nL−1\n`=0\n(n\n`\n+ 1)n\n`+1\n: the\nparameters consist of the connection matricesW\n(`)\n∈R\nn\n`\n×n\n`+1\nand bias vectorsb\n(`)\n∈R\nn\n`+1\nfor\n`= 0,...,L−1. [38]\n",
            "In our setup, the parameters are initialized as iid GaussiansN(0,1). [39]\n",
            "For  a  fixed  distributionp\nin\non  the  input  spaceR\nn\n0\n,   the  function  spaceFis  defined  as\n{f:R\nn\n0\n→R\nn\nL\n}\n. [40]\n",
            "On this space,  we consider the seminorm|| · ||\np\nin\n,  defined in terms of the\nbilinear form\n〈f,g〉\np\nin\n=E\nx∼p\nin\n[\nf(x)\nT\ng(x)\n]\n. [41]\n",
            "1\nWhile these smoothness assumptions greatly simplify the proofs of our results, they do not seem to be\nstrictly needed for the results to hold true. [42]\n",
            "2In this paper, we assume that the input distributionp\nin\nis the empirical distribution on a finite dataset\nx\n1\n,...,x\nN\n, i.e the sum of Dirac measures\n1\nN\n∑\nN\ni=0\nδ\nx\ni\n. [43]\n",
            "We define the network function byf\nθ\n(x) :=  ̃α\n(L)\n(x;θ), where the functions ̃α\n(`)\n(·;θ) :R\nn\n0\n→R\nn\n`\n(calledpreactivations) andα\n(`)\n(·;θ) :R\nn\n0\n→R\nn\n`\n(calledactivations) are defined from the0-th to\ntheL-th layer by:\nα\n(0)\n(x;θ) =x\n ̃α\n(`+1)\n(x;θ) =\n1\n√\nn\n`\nW\n(`)\nα\n(`)\n(x;θ) +βb\n(`)\nα\n(`)\n(x;θ) =σ(  ̃α\n(`)\n(x;θ)),\nwhere the nonlinearityσis applied entrywise. [44]\n",
            "The scalarβ >0is a parameter which allows us to\ntune the influence of the bias on the training. [45]\n",
            "Remark 1.Our definition of the realization functionF\n(L)\nslightly differs from the classical one. [46]\n",
            "Usually, the factors\n1\n√\nn\n`\nand the parameterβare absent and the parameters are initialized using\nwhat is sometimes called LeCun initialization, takingW\n(`)\nij\n∼ N(0,\n1\nn\n`\n)\nandb\n(`)\nj\n∼ N(0,1)(or\nsometimesb\n(`)\nj\n= 0) to compensate. [47]\n",
            "While the set of representable functionsF\n(L)\n(R\nP\n)is the same\nfor both parametrizations (with or without the factors\n1\n√\nn\n`\nandβ), the derivatives of the realization\nfunction with respect to the connections∂\nW\n(`)\nij\nF\n(L)\nand bias∂\nb\n(`)\nj\nF\n(L)\nare scaled by\n1\n√\nn\n`\nandβ\nrespectively in comparison to the classical parametrization. [48]\n",
            "The factors\n1\n√\nn\n`\nare key to obtaining a consistent asymptotic behavior of neural networks as the\nwidths of the hidden layersn\n1\n,...,n\nL−1\ngrow to infinity. [49]\n",
            "However a side-effect of these factors is\nthat they reduce greatly the influence of the connection weights during training whenn\n`\nis large: the\nfactorβis introduced to balance the influence of the bias and connection weights. [50]\n",
            "In our numerical\nexperiments, we takeβ= 0.1and use a learning rate of1.0, which is larger than usual, see Section 6. [51]\n",
            "This gives a behaviour similar to that of a classical network of width100with a learning rate of0.01. [52]\n"
        ],
        "info": [
            53,
            0
        ],
        "char_range": [
            [
                0,
                563
            ],
            [
                564,
                885
            ],
            [
                886,
                932
            ],
            [
                933,
                1004
            ],
            [
                1005,
                1185
            ],
            [
                1186,
                1284
            ],
            [
                1285,
                1382
            ],
            [
                1383,
                1519
            ],
            [
                1520,
                1700
            ],
            [
                1701,
                1878
            ],
            [
                1879,
                2000
            ],
            [
                2001,
                2124
            ],
            [
                2125,
                2299
            ],
            [
                2300,
                2465
            ],
            [
                2466,
                2578
            ],
            [
                2579,
                2693
            ],
            [
                2694,
                2770
            ],
            [
                2771,
                2905
            ],
            [
                2906,
                3031
            ],
            [
                3032,
                3198
            ],
            [
                3199,
                3331
            ],
            [
                3332,
                3487
            ],
            [
                3488,
                3567
            ],
            [
                3568,
                3667
            ],
            [
                3668,
                3814
            ],
            [
                3815,
                3969
            ],
            [
                3970,
                4132
            ],
            [
                4133,
                4293
            ],
            [
                4294,
                4719
            ],
            [
                4720,
                4854
            ],
            [
                4855,
                5000
            ],
            [
                5001,
                5139
            ],
            [
                5140,
                5364
            ],
            [
                5365,
                5500
            ],
            [
                5501,
                5646
            ],
            [
                5647,
                5737
            ],
            [
                5738,
                5999
            ],
            [
                6000,
                6112
            ],
            [
                6113,
                6299
            ],
            [
                6300,
                6368
            ],
            [
                6369,
                6488
            ],
            [
                6489,
                6621
            ],
            [
                6622,
                6771
            ],
            [
                6772,
                6944
            ],
            [
                6945,
                7312
            ],
            [
                7313,
                7408
            ],
            [
                7409,
                7506
            ],
            [
                7507,
                7742
            ],
            [
                7743,
                8080
            ],
            [
                8081,
                8240
            ],
            [
                8241,
                8467
            ],
            [
                8468,
                8584
            ],
            [
                8585,
                8686
            ]
        ]
    },
    "1": {
        "passages": [
            "3    Kernel gradient\nThe training of an ANN consists in optimizingf\nθ\nin the function spaceFwith respect to a functional\ncostC:F →R, such as a regression or cross-entropy cost. [53]\n",
            "Even for a convex functional costC,\nthe composite costC◦F\n(L)\n:R\nP\n→Ris in general highly non-convex (3). [54]\n",
            "We will show that\nduring training, the network functionf\nθ\nfollows a descent along the kernel gradient with respect to\nthe Neural Tangent Kernel (NTK) which we introduce in Section 4. [55]\n",
            "This makes it possible to study\nthe training of ANNs in the function spaceF, on which the costCis convex. [56]\n",
            "Amulti-dimensional kernelKis a functionR\nn\n0\n×R\nn\n0\n→R\nn\nL\n×n\nL\n, which maps any pair(x,x\n′\n)to\nann\nL\n×n\nL\n-matrix such thatK(x,x\n′\n) =K(x\n′\n,x)\nT\n(equivalentlyKis a symmetric tensor inF⊗F). [57]\n",
            "Such a kernel defines a bilinear map onF, taking the expectation over independentx,x\n′\n∼p\nin\n:\n〈f,g〉\nK\n:=E\nx,x\n′\n∼p\nin\n[\nf(x)\nT\nK(x,x\n′\n)g(x\n′\n)\n]\n. [58]\n",
            "The kernelKispositive definite with respect to||·||\np\nin\nif||f||\np\nin\n>0  =⇒ ||f||\nK\n>0. [59]\n",
            "We denote byF\n∗\nthe dual ofFwith respect top\nin\n, i.e. [60]\n",
            "the set of linear formsμ:F →Rof the form\nμ=〈d,·〉\np\nin\nfor somed∈ F. [61]\n",
            "Two elements ofFdefine the same linear form if and only if they\nare equal on the data. [62]\n",
            "The constructions in the paper do not depend on the elementd∈Fchosen in\norder to representμas〈d,·〉\np\nin\n. [63]\n",
            "Using the fact that the partial application of the kernelK\ni,·\n(x,·)is\na function inF, we can define a mapΦ\nK\n:F\n∗\n→ Fmapping a dual elementμ=〈d,·〉\np\nin\nto the\nfunctionf\nμ\n= Φ\nK\n(μ)with values:\nf\nμ,i\n(x) =μK\ni,·\n(x,·) =〈d,K\ni,·\n(x,·)〉\np\nin\n. [64]\n",
            "For our setup, which is that of a finite datasetx\n1\n,...,x\nn\n∈R\nn\n0\n, the cost functionalConly depends\non the values off∈Fat the data points. [65]\n",
            "As a result, the (functional) derivative of the costCat a\n3pointf\n0\n∈Fcan be viewed as an element ofF\n∗\n, which we write∂\nin\nf\nC|\nf\n0\n. [66]\n",
            "We denote byd|\nf\n0\n∈F,\na corresponding dual element, such that∂\nin\nf\nC|\nf\n0\n=〈d|\nf\n0\n,·〉\np\nin\n. [67]\n",
            "Thekernel gradient∇\nK\nC|\nf\n0\n∈Fis defined asΦ\nK\n(\n∂\nin\nf\nC|\nf\n0\n)\n. [68]\n",
            "In contrast to∂\nin\nf\nCwhich is only\ndefined on the dataset, the kernel gradient generalizes to valuesxoutside the dataset thanks to the\nkernelK:\n∇\nK\nC|\nf\n0\n(x) =\n1\nN\nN\n∑\nj=1\nK(x,x\nj\n)d|\nf\n0\n(x\nj\n). [69]\n",
            "A time-dependent functionf(t)follows thekernel gradient descent with respect toKif it satisfies\nthe differential equation\n∂\nt\nf(t) =−∇\nK\nC|\nf(t)\n. [70]\n",
            "During kernel gradient descent, the costC(f(t))evolves as\n∂\nt\nC|\nf(t)\n=−\n〈\nd|\nf(t)\n,∇\nK\nC|\nf(t)\n〉\np\nin\n=−\n∥\n∥\nd|\nf(t)\n∥\n∥\n2\nK\n. [71]\n",
            "Convergence to a critical point ofCis hence guaranteed if the kernelKis positive definite with\nrespect to||·||\np\nin\n:  the cost is then strictly decreasing except at points such that||d|\nf(t)\n||\np\nin\n= 0. [72]\n",
            "If the cost is convex and bounded from below, the functionf(t)therefore converges to a global\nminimum ast→∞. [73]\n",
            "3.1    Random functions approximation\nAs a starting point to understand the convergence of ANN gradient descent to kernel gradient descent\nin the infinite-width limit, we introduce a simple model, inspired by the approach of (19). [74]\n",
            "A kernelKcan be approximated by a choice ofPrandom functionsf\n(p)\nsampled independently\nfrom any distribution onFwhose (non-centered) covariance is given by the kernelK:\nE[f\n(p)\nk\n(x)f\n(p)\nk\n′\n(x\n′\n)] =K\nkk\n′\n(x,x\n′\n). [75]\n",
            "These functions define a random linear parametrizationF\nlin\n:R\nP\n→F\nθ7→f\nlin\nθ\n=\n1\n√\nP\nP\n∑\np=1\nθ\np\nf\n(p)\n. [76]\n",
            "The partial derivatives of the parametrization are given by\n∂\nθ\np\nF\nlin\n(θ) =\n1\n√\nP\nf\n(p)\n. [77]\n",
            "Optimizing the costC◦F\nlin\nthrough gradient descent, the parameters follow the ODE:\n∂\nt\nθ\np\n(t) =−∂\nθ\np\n(C◦F\nlin\n)(θ(t)) =−\n1\n√\nP\n∂\nin\nf\nC|\nf\nlin\nθ(t)\nf\n(p)\n=−\n1\n√\nP\n〈\nd|\nf\nlin\nθ(t)\n,f\n(p)\n〉\np\nin\n. [78]\n",
            "As a result the functionf\nlin\nθ(t)\nevolves according to\n∂\nt\nf\nlin\nθ(t)\n=\n1\n√\nP\nP\n∑\np=1\n∂\nt\nθ\np\n(t)f\n(p)\n=−\n1\nP\nP\n∑\np=1\n〈\nd|\nf\nlin\nθ(t)\n,f\n(p)\n〉\np\nin\nf\n(p)\n,\nwhere the right-hand side is equal to the kernel gradient−∇\n ̃\nK\nCwith respect to thetangent kernel\n ̃\nK=\nP\n∑\np=1\n∂\nθ\np\nF\nlin\n(θ)⊗∂\nθ\np\nF\nlin\n(θ) =\n1\nP\nP\n∑\np=1\nf\n(p)\n⊗f\n(p)\n. [79]\n",
            "This is a randomn\nL\n-dimensional kernel with values\n ̃\nK\nii\n′\n(x,x\n′\n) =\n1\nP\n∑\nP\np=1\nf\n(p)\ni\n(x)f\n(p)\ni\n′\n(x\n′\n). [80]\n",
            "Performing gradient descent on the costC◦F\nlin\nis therefore equivalent to performing kernel gradient\ndescent with the tangent kernel\n ̃\nKin the function space. [81]\n",
            "In the limit asP→∞, by the law of large\nnumbers, the (random) tangent kernel\n ̃\nKtends to the fixed kernelK, which makes this method an\napproximation of kernel gradient descent with respect to the limiting kernelK. [82]\n",
            "44    Neural tangent kernel\nFor ANNs trained using gradient descent on the compositionC◦F\n(L)\n, the situation is very similar to\nthat studied in the Section 3.1. [83]\n",
            "During training, the network functionf\nθ\nevolves along the (negative)\nkernel gradient\n∂\nt\nf\nθ(t)\n=−∇\nΘ\n(L)\nC|\nf\nθ(t)\nwith respect to theneural tangent kernel(NTK)\nΘ\n(L)\n(θ) =\nP\n∑\np=1\n∂\nθ\np\nF\n(L)\n(θ)⊗∂\nθ\np\nF\n(L)\n(θ). [84]\n",
            "However, in contrast toF\nlin\n, the realization functionF\n(L)\nof ANNs is not linear. [85]\n",
            "As a consequence,\nthe derivatives∂\nθ\np\nF\n(L)\n(θ)and the neural tangent kernel depend on the parametersθ. [86]\n",
            "The NTK\nis therefore random at initialization and varies during training, which makes the analysis of the\nconvergence off\nθ\nmore delicate. [87]\n",
            "In the next subsections, we show that, in the infinite-width limit, the NTK becomes deterministic at\ninitialization and stays constant during training. [88]\n",
            "Sincef\nθ\nat initialization is Gaussian in the limit, the\nasymptotic behavior off\nθ\nduring training can be explicited in the function spaceF. [89]\n",
            "4.1    Initialization\nAs observed in (16;4;7;13;6), the output functionsf\nθ,i\nfori=  1,...,n\nL\ntend to iid Gaussian\nprocesses in the infinite-width limit (a proof in our setup is given in the appendix):\nProposition 1. [90]\n",
            "For a network of depthLat initialization, with a Lipschitz nonlinearityσ, and in the\nlimit asn\n1\n,...,n\nL−1\n→∞, the output functionsf\nθ,k\n, fork= 1,...,n\nL\n, tend (in law) to iid centered\nGaussian processes of covarianceΣ\n(L)\n, whereΣ\n(L)\nis defined recursively by:\nΣ\n(1)\n(x,x\n′\n) =\n1\nn\n0\nx\nT\nx\n′\n+β\n2\nΣ\n(L+1)\n(x,x\n′\n) =E\nf∼N\n(\n0,Σ\n(L)\n)\n[σ(f(x))σ(f(x\n′\n))] +β\n2\n,\ntaking the expectation with respect to a centered Gaussian processfof covarianceΣ\n(L)\n. [91]\n",
            "Remark 2. [92]\n"
        ],
        "info": [
            40,
            53
        ],
        "char_range": [
            [
                8687,
                8863
            ],
            [
                8864,
                8969
            ],
            [
                8970,
                9153
            ],
            [
                9154,
                9259
            ],
            [
                9260,
                9450
            ],
            [
                9451,
                9599
            ],
            [
                9600,
                9688
            ],
            [
                9689,
                9743
            ],
            [
                9744,
                9811
            ],
            [
                9812,
                9898
            ],
            [
                9899,
                10004
            ],
            [
                10005,
                10246
            ],
            [
                10247,
                10388
            ],
            [
                10389,
                10524
            ],
            [
                10525,
                10620
            ],
            [
                10621,
                10688
            ],
            [
                10689,
                10886
            ],
            [
                10887,
                11033
            ],
            [
                11034,
                11161
            ],
            [
                11162,
                11366
            ],
            [
                11367,
                11475
            ],
            [
                11476,
                11706
            ],
            [
                11707,
                11925
            ],
            [
                11926,
                12032
            ],
            [
                12033,
                12124
            ],
            [
                12125,
                12322
            ],
            [
                12323,
                12654
            ],
            [
                12655,
                12768
            ],
            [
                12769,
                12928
            ],
            [
                12929,
                13143
            ],
            [
                13144,
                13305
            ],
            [
                13306,
                13521
            ],
            [
                13522,
                13605
            ],
            [
                13606,
                13710
            ],
            [
                13711,
                13849
            ],
            [
                13850,
                14001
            ],
            [
                14002,
                14142
            ],
            [
                14143,
                14360
            ],
            [
                14361,
                14813
            ],
            [
                14814,
                14823
            ]
        ]
    },
    "2": {
        "passages": [
            "Strictly speaking, the existence of a suitable Gaussian measure with covarianceΣ\n(L)\nis\nnot needed: we only deal with the values offatx,x\n′\n(the joint measure onf(x),f(x\n′\n)is simply a\nGaussian vector in 2D). [93]\n",
            "For the same reasons, in the proof of Proposition 1 and Theorem 1, we will\nfreely speak of Gaussian processes without discussing their existence. [94]\n",
            "The first key result of our paper (proven in the appendix) is the following:  in the same limit, the\nNeural Tangent Kernel (NTK) converges in probability to an explicit deterministic limit. [95]\n",
            "Theorem 1. [96]\n",
            "For a network of depthLat initialization, with a Lipschitz nonlinearityσ, and in the\nlimit as the layers widthn\n1\n,...,n\nL−1\n→∞, the NTKΘ\n(L)\nconverges in probability to a deterministic\nlimiting kernel:\nΘ\n(L)\n→Θ\n(L)\n∞\n⊗Id\nn\nL\n. [97]\n",
            "The scalar kernelΘ\n(L)\n∞\n:R\nn\n0\n×R\nn\n0\n→Ris defined recursively by\nΘ\n(1)\n∞\n(x,x\n′\n) = Σ\n(1)\n(x,x\n′\n)\nΘ\n(L+1)\n∞\n(x,x\n′\n) = Θ\n(L)\n∞\n(x,x\n′\n)\n ̇\nΣ\n(L+1)\n(x,x\n′\n) + Σ\n(L+1)\n(x,x\n′\n),\nwhere\n ̇\nΣ\n(L+1)\n(x,x\n′\n) =E\nf∼N\n(\n0,Σ\n(L)\n)\n[  ̇σ(f(x))  ̇σ(f(x\n′\n))],\ntaking the expectation with respect to a centered Gaussian processfof covarianceΣ\n(L)\n, and where\n ̇σdenotes the derivative ofσ. [98]\n",
            "Remark 3.By Rademacher’s theorem, ̇σis defined everywhere, except perhaps on a set of zero\nLebesgue measure. [99]\n",
            "Note that the limitingΘ\n(L)\n∞\nonly depends on the choice ofσ, the depth of the network and the variance\nof the parameters at initialization (which is equal to1in our setting). [100]\n",
            "54.2    Training\nOur second key result is that the NTK stays asymptotically constant during training. [101]\n",
            "This applies\nfor a slightly more general definition of training: the parameters are updated according to a training\ndirectiond\nt\n∈F:\n∂\nt\nθ\np\n(t) =\n〈\n∂\nθ\np\nF\n(L)\n(θ(t)),d\nt\n〉\np\nin\n. [102]\n",
            "In the case of gradient descent,d\nt\n=−d|\nf\nθ(t)\n(see Section 3), but the direction may depend on\nanother network, as is the case for e.g. [103]\n",
            "Generative Adversarial Networks (10). [104]\n",
            "We only assume that\nthe integral\n∫\nT\n0\n‖d\nt\n‖\np\nin\ndt\nstays stochastically bounded as the width tends to infinity, which is verified\nfor e.g. [105]\n",
            "least-squares regression, see Section 5. [106]\n",
            "Theorem 2. [107]\n",
            "Assume thatσis a Lipschitz, twice differentiable nonlinearity function, with bounded\nsecond derivative. [108]\n",
            "For anyTsuch that the integral\n∫\nT\n0\n‖d\nt\n‖\np\nin\ndtstays stochastically bounded, as\nn\n1\n,...,n\nL−1\n→∞, we have, uniformly fort∈[0,T],\nΘ\n(L)\n(t)→Θ\n(L)\n∞\n⊗Id\nn\nL\n. [109]\n",
            "As a consequence, in this limit, the dynamics off\nθ\nis described by the differential equation\n∂\nt\nf\nθ(t)\n= Φ\nΘ\n(L)\n∞\n⊗Id\nn\nL\n(\n〈d\nt\n,·〉\np\nin\n)\n. [110]\n",
            "Remark 4.As the proof of the theorem (in the appendix) shows, the variation during training of the\nindividual activations in the hidden layers shrinks as their width grows. [111]\n",
            "However their collective\nvariation is significant, which allows the parameters of the lower layers to learn: in the formula of\nthe limiting NTKΘ\n(L+1)\n∞\n(x,x\n′\n)\nin Theorem 1, the second summandΣ\n(L+1)\nrepresents the learning\ndue to the last layer, while the first summand represents the learning performed by the lower layers. [112]\n",
            "As discussed in Section 3, the convergence of kernel gradient descent to a critical point of the cost\nCis guaranteed for positive definite kernels. [113]\n",
            "The limiting NTK is positive definite if the span of\nthe derivatives∂\nθ\np\nF\n(L)\n,p= 1,...,Pbecomes dense inFw.r.t. [114]\n",
            "thep\nin\n-norm as the width grows\nto infinity. [115]\n",
            "It seems natural to postulate that the span of the preactivations of the last layer (which\nthemselves appear in∂\nθ\np\nF\n(L)\n, corresponding to the connection weights of the last layer) becomes\ndense inF, for a large family of measuresp\nin\nand nonlinearities (see e.g. [116]\n",
            "(11;14) for classical\ntheorems about ANNs and approximation). [117]\n",
            "In the case when the dataset is supported on a sphere, the\npositive-definiteness of the limiting NTK can be shown using Gaussian integration techniques and\nexisting positive-definiteness criteria, as given by the following proposition, proven in Appendix A.4:\nProposition 2.For a non-polynomial Lipschitz nonlinearityσ, for any input dimensionn\n0\n, the\nrestriction of the limiting NTKΘ\n(L)\n∞\nto the unit sphereS\nn\n0\n−1\n={x∈R\nn\n0\n:x\nT\nx= 1}is positive-\ndefinite ifL≥2. [118]\n",
            "5    Least-squares regression\nGiven a goal functionf\n∗\nand input distributionp\nin\n, the least-squares regression cost is\nC(f) =\n1\n2\n||f−f\n∗\n||\n2\np\nin\n=\n1\n2\nE\nx∼p\nin\n[\n‖f(x)−f\n∗\n(x)‖\n2\n]\n. [119]\n",
            "Theorems 1 and 2 apply to an ANN trained on such a cost. [120]\n",
            "Indeed the norm of the training direction\n‖d(f)‖\np\nin\n=‖f\n∗\n−f‖\np\nin\nis strictly decreasing during training, bounding the integral. [121]\n",
            "We are\ntherefore interested in the behavior of a functionf\nt\nduring kernel gradient descent with a kernelK\n(we are of course especially interested in the caseK= Θ\n(L)\n∞\n⊗Id\nn\nL\n):\n∂\nt\nf\nt\n= Φ\nK\n(\n〈f\n∗\n−f,·〉\np\nin\n)\n. [122]\n",
            "The  solution  of  this  differential  equation  can  be  expressed  in  terms  of  the  mapΠ  :f7→\nΦ\nK\n(\n〈f,·〉\np\nin\n)\n:\nf\nt\n=f\n∗\n+e\n−tΠ\n(f\n0\n−f\n∗\n)\n6wheree\n−tΠ\n=\n∑\n∞\nk=0\n(−t)\nk\nk! [123]\n",
            "Π\nk\nis the exponential of−tΠ. [124]\n",
            "IfΠcan be diagonalized by eigenfunctions\nf\n(i)\nwith eigenvaluesλ\ni\n, the exponentiale\n−tΠ\nhas the same eigenfunctions with eigenvaluese\n−tλ\ni\n. [125]\n",
            "For a finite datasetx\n1\n,...,x\nN\nof sizeN, the mapΠtakes the form\nΠ(f)\nk\n(x) =\n1\nN\nN\n∑\ni=1\nn\nL\n∑\nk\n′\n=1\nf\nk\n′\n(x\ni\n)K\nkk\n′\n(x\ni\n,x). [126]\n",
            "The mapΠhas at mostNn\nL\npositive eigenfunctions, and they are the kernel principal components\nf\n(1)\n,...,f\n(Nn\nL\n)\nof the data with respect to to the kernelK(21;22). [127]\n",
            "The corresponding eigenvalues\nλ\ni\nis the variance captured by the component. [128]\n",
            "Decomposing the difference(f\n∗\n−f\n0\n) = ∆\n0\nf\n+ ∆\n1\nf\n+...+ ∆\nNn\nL\nf\nalong the eigenspaces ofΠ, the\ntrajectory of the functionf\nt\nreads\nf\nt\n=f\n∗\n+ ∆\n0\nf\n+\nNn\nL\n∑\ni=1\ne\n−tλ\ni\n∆\ni\nf\n,\nwhere∆\n0\nf\nis in the kernel (null-space) ofΠand∆\ni\nf\n∝f\n(i)\n. [129]\n",
            "The above decomposition can be seen as a motivation for the use of early stopping. [130]\n",
            "The convergence\nis indeed faster along the eigenspaces corresponding to larger eigenvaluesλ\ni\n. [131]\n",
            "Early stopping hence\nfocuses the convergence on the most relevant kernel principal components, while avoiding to fit\nthe ones in eigenspaces with lower eigenvalues (such directions are typically the ‘noisier’ ones: for\ninstance, in the case of the RBF kernel, lower eigenvalues correspond to high frequency functions). [132]\n",
            "Note that by the linearity of the mape\n−tΠ\n, iff\n0\nis initialized with a Gaussian distribution (as is the\ncase for ANNs in the infinite-width limit), thenf\nt\nis Gaussian for all timest. [133]\n"
        ],
        "info": [
            41,
            93
        ],
        "char_range": [
            [
                14824,
                15032
            ],
            [
                15033,
                15178
            ],
            [
                15179,
                15368
            ],
            [
                15369,
                15379
            ],
            [
                15380,
                15607
            ],
            [
                15608,
                15987
            ],
            [
                15988,
                16096
            ],
            [
                16097,
                16272
            ],
            [
                16273,
                16374
            ],
            [
                16375,
                16555
            ],
            [
                16556,
                16693
            ],
            [
                16694,
                16731
            ],
            [
                16732,
                16873
            ],
            [
                16874,
                16914
            ],
            [
                16915,
                16925
            ],
            [
                16926,
                17029
            ],
            [
                17030,
                17191
            ],
            [
                17192,
                17336
            ],
            [
                17337,
                17509
            ],
            [
                17510,
                17837
            ],
            [
                17838,
                17985
            ],
            [
                17986,
                18100
            ],
            [
                18101,
                18146
            ],
            [
                18147,
                18413
            ],
            [
                18414,
                18475
            ],
            [
                18476,
                18943
            ],
            [
                18944,
                19131
            ],
            [
                19132,
                19188
            ],
            [
                19189,
                19320
            ],
            [
                19321,
                19536
            ],
            [
                19537,
                19717
            ],
            [
                19718,
                19747
            ],
            [
                19748,
                19891
            ],
            [
                19892,
                20024
            ],
            [
                20025,
                20190
            ],
            [
                20191,
                20267
            ],
            [
                20268,
                20511
            ],
            [
                20512,
                20594
            ],
            [
                20595,
                20690
            ],
            [
                20691,
                21009
            ],
            [
                21010,
                21195
            ]
        ]
    },
    "3": {
        "passages": [
            "Assuming that the kernel\nis positive definite on the data (implying that theNn\nL\n×Nn\nL\nGram marix\n ̃\nK= (K\nkk\n′\n(x\ni\n,x\nj\n))\nik,jk\n′\nis invertible), ast→∞limit, we get thatf\n∞\n=f\n∗\n+ ∆\n0\nf\n=f\n0\n−\n∑\ni\n∆\ni\nf\ntakes the form\nf\n∞,k\n(x) =κ\nT\nx,k\n ̃\nK\n−1\ny\n∗\n+\n(\nf\n0\n(x)−κ\nT\nx,k\n ̃\nK\n−1\ny\n0\n)\n,\nwith theNn\nl\n-vectorsκ\nx,k\n,y\n∗\nandy\n0\ngiven by\nκ\nx,k\n= (K\nkk\n′\n(x,x\ni\n))\ni,k\n′\ny\n∗\n= (f\n∗\nk\n(x\ni\n))\ni,k\ny\n0\n= (f\n0,k\n(x\ni\n))\ni,k\n. [134]\n",
            "The first term, the mean, has an important statistical interpretation: it is the maximum-a-posteriori\n(MAP) estimate given a Gaussian prior on functionsf\nk\n∼N(0,Θ\n(L)\n∞\n)\nand the conditionsf\nk\n(x\ni\n) =\nf\n∗\nk\n(x\ni\n). [135]\n",
            "Equivalently, it is equal to the kernel ridge regression (22) as the regularization goes to\nzero (λ→0). [136]\n",
            "The second term is a centered Gaussian whose variance vanishes on the points of the\ndataset. [137]\n",
            "6    Numerical experiments\nIn the following numerical experiments, fully connected ANNs of various widths are compared to the\ntheoretical infinite-width limit. [138]\n",
            "We choose the size of the hidden layers to all be equal to the same\nvaluen:=n\n1\n=...=n\nL−1\nand we take the ReLU nonlinearityσ(x) = max(0,x). [139]\n",
            "In the first two experiments, we consider the casen\n0\n= 2. [140]\n",
            "Moreover, the input elements are taken on\nthe unit circle. [141]\n",
            "This can be motivated by the structure of high-dimensional data, where the centered\ndata points often have roughly the same norm\n2\n. [142]\n",
            "In all experiments, we tookn\nL\n= 1(note that by our results, a network withn\nL\noutputs behaves\nasymptotically liken\nL\nnetworks with scalar outputs trained independently). [143]\n",
            "Finally, the value of the\nparameterβis chosen as0.1, see Remark 1. [144]\n",
            "2\nThe classical example is for data following a Gaussian distributionN(0,Id\nn\n0\n): as the dimensionn\n0\ngrows,\nall data points have approximately the same norm\n√\nn\n0\n. [145]\n",
            "73210123\n0.05\n0.10\n0.15\n0.20\n0.25\n0.30\n0.35\n0.40\nn = 500, t = 0\nn = 500, t = 20\nn = 10000, t = 0\nn = 10000, 0\nn = 500, t = 0\nn = 500, t = 200\nn = 10000, t = 0\nn = 10000, t = 200\nFigure 1: Convergence of the NTK to a fixed limit\nfor two widthsnand two timest. [146]\n",
            "3210123\n0.4\n0.2\n0.0\n0.2\n0.4\nf \n(\nsin\n(  ), \ncos\n(  ))\nn = 50\nn = 1000\nn =, P\n50\nn =, {P\n10\n, P\n90\n}\nFigure 2: Networks functionf\nθ\nnear convergence\nfor two widthsnand 10th,  50th and 90th per-\ncentiles of the asymptotic Gaussian distribution. [147]\n",
            "6.1    Convergence of the NTK\nThe first experiment illustrates the convergence of the NTKΘ\n(L)\nof a network of depthL= 4for\ntwo different widthsn= 500,10000. [148]\n",
            "The functionΘ\n(4)\n(x\n0\n,x)is plotted for a fixedx\n0\n= (1,0)\nandx= (cos(γ),sin(γ))on the unit circle in Figure 1. [149]\n",
            "To observe the distribution of the NTK,10\nindependent initializations are performed for both widths. [150]\n",
            "The kernels are plotted at initialization\nt=  0and then after200steps of gradient descent with learning rate1.0(i.e. [151]\n",
            "att=  200). [152]\n",
            "We\napproximate the functionf\n∗\n(x) =x\n1\nx\n2\nwith a least-squares cost on randomN(0,1)inputs. [153]\n",
            "For the wider network, the NTK shows less variance and is smoother. [154]\n",
            "It is interesting to note that\nthe expectation of the NTK is very close for both networks widths. [155]\n",
            "After200steps of training, we\nobserve that the NTK tends to “inflate”. [156]\n",
            "As expected, this effect is much less apparent for the wider\nnetwork (n= 10000) where the NTK stays almost fixed, than for the smaller network (n= 500). [157]\n",
            "6.2    Kernel regression\nFor a regression cost, the infinite-width limit network functionf\nθ(t)\nhas a Gaussian distribution for\nall timestand in particular at convergencet→ ∞(see Section 5). [158]\n",
            "We compared the theoretical\nGaussian distribution att→ ∞to the distribution of the network functionf\nθ(T)\nof a finite-width\nnetwork for a large timeT=  1000. [159]\n",
            "For two different widthsn=  50,1000and for10random\ninitializations each, a network is trained on a least-squares cost on4points of the unit circle for1000\nsteps with learning rate1.0and then plotted in Figure 2. [160]\n",
            "We also approximated the kernelsΘ\n(4)\n∞\nandΣ\n(4)\nusing a large-width network (n= 10000) and used\nthem to calculate and plot the 10th, 50th and 90-th percentiles of thet→ ∞limiting Gaussian\ndistribution. [161]\n",
            "The distributions of the network functions are very similar for both widths: their mean and variance\nappear to be close to those of the limiting distributiont→ ∞. [162]\n",
            "Even for relatively small widths\n(n= 50), the NTK gives a good indication of the distribution off\nθ(t)\nast→∞. [163]\n",
            "6.3    Convergence along a principal component\nWe now illustrate our result on the MNIST dataset of handwritten digits made up of grayscale images\nof dimension28×28, yielding a dimension ofn\n0\n= 784. [164]\n",
            "We computed the first 3 principal components of a batch ofN= 512digits with respect to the NTK\nof a high-width networkn= 10000(giving an approximation of the limiting kernel) using a power\niteration method. [165]\n",
            "The respective eigenvalues areλ\n1\n= 0.0457,λ\n2\n= 0.00108andλ\n3\n= 0.00078. [166]\n",
            "The kernel PCA is non-centered, the first component is therefore almost equal to the constant function,\n8321012\nf\n(2)\n(x)\n2\n1\n0\n1\n2\nf\n(3)\n(\nx\n)\n(a)  The  2nd  and  3rd  principal\ncomponents of MNIST. [167]\n",
            "05001000150020002500300035004000\nt\n0.00\n0.02\n0.04\n0.06\n0.08\n0.10\n0.12\n0.14\nn = 100\nn = 1000\nn = 10000\n||\nh\nt\n||\np\nin\n(b) Deviation of the network function\nf\nθ\nfrom the straight line. [168]\n",
            "05001000150020002500300035004000\nt\n0.0\n0.1\n0.2\n0.3\n0.4\n0.5\nn = 100\nn = 1000\nn = 10000\nn =\n||\ng\nt\n||\np\nin\n(c) Convergence off\nθ\nalong the 2nd\nprincipal component. [169]\n",
            "Figure 3\nwhich explains the large gap between the first and second eigenvalues\n3\n. [170]\n",
            "The next two components are\nmuch more interesting as can be seen in Figure 3a, where the batch is plotted withxandycoordinates\ncorresponding to the 2nd and 3rd components. [171]\n",
            "We have seen in Section 5 how the convergence of kernel gradient descent follows the kernel principal\ncomponents. [172]\n",
            "If the difference at initializationf\n0\n−f\n∗\nis equal (or proportional) to one of the principal\ncomponentsf\n(i)\n, then the function will converge along a straight line (in the function space) tof\n∗\nat\nan exponential ratee\n−λ\ni\nt\n. [173]\n",
            "We tested whether ANNs of various widthsn= 100,1000,10000behave in a similar manner. [174]\n",
            "We\nset the goal of the regression cost tof\n∗\n=f\nθ(0)\n+ 0.5f\n(2)\nand let the network converge. [175]\n",
            "At each time\nstept, we decomposed the differencef\nθ(t)\n−f\n∗\ninto a componentg\nt\nproportional tof\n(2)\nand another\noneh\nt\northogonal tof\n(2)\n. [176]\n",
            "In the infinite-width limit, the first component decays exponentially fast\n||g\nt\n||\np\nin\n= 0.5e\n−λ\n2\nt\nwhile the second is null (h\nt\n= 0), as the function converges along a straight line. [177]\n"
        ],
        "info": [
            44,
            134
        ],
        "char_range": [
            [
                21196,
                21615
            ],
            [
                21616,
                21831
            ],
            [
                21832,
                21935
            ],
            [
                21936,
                22028
            ],
            [
                22029,
                22188
            ],
            [
                22189,
                22329
            ],
            [
                22330,
                22388
            ],
            [
                22389,
                22447
            ],
            [
                22448,
                22580
            ],
            [
                22581,
                22751
            ],
            [
                22752,
                22818
            ],
            [
                22819,
                22985
            ],
            [
                22986,
                23244
            ],
            [
                23245,
                23487
            ],
            [
                23488,
                23645
            ],
            [
                23646,
                23758
            ],
            [
                23759,
                23859
            ],
            [
                23860,
                23976
            ],
            [
                23977,
                23988
            ],
            [
                23989,
                24081
            ],
            [
                24082,
                24149
            ],
            [
                24150,
                24247
            ],
            [
                24248,
                24318
            ],
            [
                24319,
                24471
            ],
            [
                24472,
                24662
            ],
            [
                24663,
                24820
            ],
            [
                24821,
                25032
            ],
            [
                25033,
                25235
            ],
            [
                25236,
                25398
            ],
            [
                25399,
                25508
            ],
            [
                25509,
                25708
            ],
            [
                25709,
                25915
            ],
            [
                25916,
                25989
            ],
            [
                25990,
                26189
            ],
            [
                26190,
                26372
            ],
            [
                26373,
                26534
            ],
            [
                26535,
                26617
            ],
            [
                26618,
                26789
            ],
            [
                26790,
                26903
            ],
            [
                26904,
                27133
            ],
            [
                27134,
                27218
            ],
            [
                27219,
                27312
            ],
            [
                27313,
                27453
            ],
            [
                27454,
                27641
            ]
        ]
    },
    "4": {
        "passages": [
            "As expected, we see in Figure 3b that the wider the network, the less it deviates from the straight line\n(for each widthnwe performed two independent trials). [178]\n",
            "As the width grows, the trajectory along the\n2nd principal component (shown in Figure 3c) converges to the theoretical limit shown in blue. [179]\n",
            "A surprising observation is that smaller networks appear to converge faster than wider ones. [180]\n",
            "This may\nbe explained by the inflation of the NTK observed in our first experiment. [181]\n",
            "Indeed, multiplying the\nNTK by a factorais equivalent to multiplying the learning rate by the same factor. [182]\n",
            "However, note\nthat since the NTK of large-width network is more stable during training, larger learning rates can in\nprinciple be taken. [183]\n",
            "One must hence be careful when comparing the convergence speed in terms of the\nnumber of steps (rather than in terms of the timet): both the inflation effect and the learning rate\nmust be taken into account. [184]\n",
            "7    Conclusion\nThis paper introduces a new tool to study ANNs, the Neural Tangent Kernel (NTK), which describes\nthe local dynamics of an ANN during gradient descent. [185]\n",
            "This leads to a new connection between ANN\ntraining and kernel methods: in the infinite-width limit, an ANN can be described in the function\nspace directly by the limit of the NTK, an explicit constant kernelΘ\n(L)\n∞\n, which only depends on\nits depth, nonlinearity and parameter initialization variance. [186]\n",
            "More precisely, in this limit, ANN\ngradient descent is shown to be equivalent to a kernel gradient descent with respect toΘ\n(L)\n∞\n. [187]\n",
            "The\nlimit of the NTK is hence a powerful tool to understand the generalization properties of ANNs, and\nit allows one to study the influence of the depth and nonlinearity on the learning abilities of the\nnetwork. [188]\n",
            "The analysis of training using NTK allows one to relate convergence of ANN training with\nthe positive-definiteness of the limiting NTK and leads to a characterization of the directions favored\nby early stopping methods. [189]\n",
            "3\nIt can be observed numerically, that if we chooseβ= 1.0instead of our recommended0.1, the gap between\nthe first and the second principal component is about ten times bigger, which makes training more difficult. [190]\n",
            "9Acknowledgements\nThe authors thank K. [191]\n",
            "Kyt\n ̈\nol\n ̈\na for many interesting discussions. [192]\n",
            "The second author was supported by\nthe ERC CG CRITICAL. [193]\n",
            "The last author acknowledges support from the ERC SG Constamis, the\nNCCR SwissMAP, the Blavatnik Family Foundation and the Latsis Foundation. [194]\n"
        ],
        "info": [
            17,
            178
        ],
        "char_range": [
            [
                27642,
                27800
            ],
            [
                27801,
                27940
            ],
            [
                27941,
                28033
            ],
            [
                28034,
                28117
            ],
            [
                28118,
                28224
            ],
            [
                28225,
                28361
            ],
            [
                28362,
                28569
            ],
            [
                28570,
                28736
            ],
            [
                28737,
                29039
            ],
            [
                29040,
                29171
            ],
            [
                29172,
                29383
            ],
            [
                29384,
                29603
            ],
            [
                29604,
                29816
            ],
            [
                29817,
                29855
            ],
            [
                29856,
                29904
            ],
            [
                29905,
                29960
            ],
            [
                29961,
                30102
            ]
        ]
    }
}

export const ids = [
    0,
    23,
    25,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    55,
    57,
    70,
    71,
    72,
    90,
    97,
    122,
    123,
    124,
    130,
    131,
    132,
    148,
    159,
    164,
    165,
    166
]

export const summaryText = `
This paper explores the behavior of Artificial Neural Networks (ANNs) in the infinite-width limit, connecting them to kernel methods via the Neural Tangent Kernel (NTK). [0, 23, 25]

**Theoretical Results:**

- **Kernel Gradient Descent:** During gradient descent, the network function \( f_\theta \) follows kernel gradient descent in function space with respect to a limiting kernel, dependent on network depth, nonlinearity, and initialization variance [28, 55]. A time-dependent function \( f(t) \) follows the kernel gradient descent with respect to \( K \) if it satisfies the differential equation:
  \[
  \partial_t f(t) = -\nabla_K C|_{f(t)}.
  \]
  The cost \( C(f(t)) \) evolves as:
  \[
  \partial_t C|_{f(t)} = -\langle d|_{f(t)}, \nabla_K C|_{f(t)} \rangle_{p_{in}} = -\|d|_{f(t)}\|_K^2.
  \]
  Convergence to a critical point of \( C \) is guaranteed if \( K \) is positive definite [70, 71, 72].
- **Convergence and Positive-Definiteness:** Convergence during training relates to the positive-definiteness of the infinite-width limit NTK, proven for data supported on a sphere using dual activation functions [29, 30]. The NTK describes the values of the network function outside the training set and is crucial for understanding generalization [31].
- **Linear Differential Equation:** For least-squares regression, \( f_\theta \) follows a linear differential equation in the infinite-width limit, where eigenfunctions of the Jacobian are kernel principal components of the input data [32]. This connection to kernel methods motivates early stopping to reduce overfitting [33, 130, 131, 132]. The behavior of a function \( f_t \) during kernel gradient descent with kernel \( K \) is:
  \[
  \partial_t f_t = \Phi_K (\langle f^* - f, \cdot \rangle_{p_{in}}).
  \]
  The solution can be expressed in terms of the map \( \Pi : f \mapsto \Phi_K (\langle f, \cdot \rangle_{p_{in}}) \):
  \[
  f_t = f^* + e^{-t\Pi} (f_0 - f^*),
  \]
  where \( e^{-t\Pi} = \sum_{k=0}^\infty \frac{(-t)^k}{k!} \Pi^k \) [122, 123, 124].

**Key Findings and Definitions:**

- **NTK Limit:** In the limit as layer widths \( n_1, ..., n_{L-1} \rightarrow \infty \), the Neural Tangent Kernel (NTK) \( \Theta^{(L)} \) of a depth \( L \) network with a Lipschitz nonlinearity \( \sigma \) converges in probability to a deterministic limiting kernel \( \Theta^{(L)}_\infty \otimes Id_{n_L} \) [97].
- **Gaussian Processes:** In the infinite-width limit, the output functions \( f_{\theta, i} \) tend to i.i.d. Gaussian processes [90].
- **Kernel Definition:** A multi-dimensional kernel \( K \) is defined as a function \( K: R^{n_0} \times R^{n_0} \rightarrow R^{n_L \times n_L} \) such that \( K(x, x') = K(x', x)^T \) [57].

**Numerical Verification:**

- Theoretical results are numerically validated on artificial and MNIST datasets, showing that wide ANNs behave close to the theoretical limit [34, 35, 164].
- Experiments demonstrate the convergence of the NTK, compare the theoretical Gaussian distribution to the network function distribution, and illustrate results on the MNIST dataset [148, 159].
- The first 3 principal components of a batch of \( N = 512 \) digits with respect to the NTK of a high-width network \( n = 10000 \) were computed [165]. The respective eigenvalues are \( \lambda_1 = 0.0457 \), \( \lambda_2 = 0.00108 \) and \( \lambda_3 = 0.00078 \) [166].

`

export const highlightex = {
    "id": "165",
    "content": {
        "text": "f n0 = 784.We computed the first 3 principal components of a batch of N = 512 digits with respect to the NTKof a high-width network n = 10000 (giving an approximation of the limiting kernel) using a poweriteration"
    },
    "position": {
        "boundingRect": {
            "x1": 107.532,
            "y1": 670.884,
            "x2": 504.3611081792,
            "y2": 719.0536,
            "width": 396.82910817920003,
            "height": 48.169599999999946
        },
        "rects": [
            {
                "x1": 194.89599999999996,
                "y1": 670.884,
                "x2": 294.2430472,
                "y2": 680.8466,
                "width": 99.3470472,
                "height": 9.9626
            },
            {
                "x1": 294.2430471999998,
                "y1": 670.884,
                "x2": 296.73299999999995,
                "y2": 682.884,
                "width": 2.4899528000001396,
                "height": 12
            },
            {
                "x1": 296.73299999999995,
                "y1": 670.884,
                "x2": 302.71255252,
                "y2": 680.8466,
                "width": 5.97955252,
                "height": 9.9626
            },
            {
                "x1": 302.71299999999997,
                "y1": 672.379,
                "x2": 306.68457909999995,
                "y2": 679.3528,
                "width": 3.9715790999999996,
                "height": 6.9738
            },
            {
                "x1": 306.68457909999995,
                "y1": 672.379,
                "x2": 309.95,
                "y2": 684.379,
                "width": 3.265420900000038,
                "height": 12
            },
            {
                "x1": 309.95,
                "y1": 670.884,
                "x2": 335.41241307999996,
                "y2": 680.8466,
                "width": 25.462413079999976,
                "height": 9.9626
            },
            {
                "x1": 335.40999999999997,
                "y1": 670.884,
                "x2": 337.90065,
                "y2": 680.8466,
                "width": 2.49065,
                "height": 9.9626
            },
            {
                "x1": 107.532,
                "y1": 687.273,
                "x2": 341.9444861248001,
                "y2": 697.2356,
                "width": 234.4124861248001,
                "height": 9.9626
            },
            {
                "x1": 341.9444861248,
                "y1": 687.273,
                "x2": 344.4591170473807,
                "y2": 699.273,
                "width": 2.514630922580673,
                "height": 12
            },
            {
                "x1": 344.439,
                "y1": 687.273,
                "x2": 352.4439491,
                "y2": 697.2356,
                "width": 8.004949100000001,
                "height": 9.9626
            },
            {
                "x1": 352.4439491,
                "y1": 687.273,
                "x2": 356.308,
                "y2": 699.273,
                "width": 3.864050899999995,
                "height": 12
            },
            {
                "x1": 356.308,
                "y1": 687.273,
                "x2": 381.78037568,
                "y2": 697.2356,
                "width": 25.472375680000027,
                "height": 9.9626
            },
            {
                "x1": 381.78037567999996,
                "y1": 687.273,
                "x2": 384.274,
                "y2": 699.273,
                "width": 2.4936243200000376,
                "height": 12
            },
            {
                "x1": 384.274,
                "y1": 687.273,
                "x2": 504.3611081792,
                "y2": 697.2356,
                "width": 120.0871081792,
                "height": 9.9626
            },
            {
                "x1": 108,
                "y1": 698.182,
                "x2": 204.82371987200003,
                "y2": 708.1446,
                "width": 96.82371987200001,
                "height": 9.9626
            },
            {
                "x1": 204.82371987200003,
                "y1": 698.182,
                "x2": 207.30706661303586,
                "y2": 710.182,
                "width": 2.4833467410358376,
                "height": 12
            },
            {
                "x1": 207.317,
                "y1": 698.182,
                "x2": 213.29655252,
                "y2": 708.1446,
                "width": 5.97955252,
                "height": 9.9626
            },
            {
                "x1": 213.29655252,
                "y1": 698.182,
                "x2": 216.066,
                "y2": 710.182,
                "width": 2.7694474799999966,
                "height": 12
            },
            {
                "x1": 216.066,
                "y1": 698.182,
                "x2": 251.49101308000002,
                "y2": 708.1446,
                "width": 35.42501308000001,
                "height": 9.9626
            },
            {
                "x1": 251.49101308000002,
                "y1": 698.182,
                "x2": 253.981,
                "y2": 710.182,
                "width": 2.4899869199999785,
                "height": 12
            },
            {
                "x1": 253.981,
                "y1": 698.182,
                "x2": 504.1722918552002,
                "y2": 708.1446,
                "width": 250.1912918552002,
                "height": 9.9626
            },
            {
                "x1": 108,
                "y1": 709.091,
                "x2": 306.8064725280001,
                "y2": 719.0536,
                "width": 198.80647252800006,
                "height": 9.9626
            }
        ],
        "pageNumber": 8,
        "usePdfCoordinates": false
    },
    "color": "#FFEB3B",
    "comment": {
        "text": "165",
        "emoji": ""
    },
    "url": "highlightcite-165"
}

const x = `Artificial Neural Networks (ANNs) in the infinite-width limit are equivalent to Gaussian processes, linking them to kernel methods [0, 23]. This paper examines the network function \( f_\theta \) of an ANN, which maps input vectors to output vectors, where \( \theta \) represents the ANN's parameters [26].

Key findings include:

*   **Kernel Gradient Descent:** During gradient descent, the network function \( f_\theta \) follows the kernel gradient descent in function space with respect to a limiting kernel, which depends on the network's depth, nonlinearity, and initialization variance [28].
*   **Neural Tangent Kernel (NTK):** The evolution of an ANN during training can be described by a kernel. During gradient descent on the parameters of an ANN, the network function \( f_\theta \) follows the kernel gradient of the functional cost with respect to the NTK [1, 2]. In the infinite-width limit, the NTK converges to an explicit limiting kernel and remains constant during training [4].
*   **Convergence:** Convergence during training relates to the positive-definiteness of the infinite-width limit NTK. The paper proves this positive-definiteness when the dataset is supported on a sphere and the nonlinearity is non-polynomial [6, 7, 30].
*   **Linear Differential Equation:** For a least-squares regression loss, the network function \( f_\theta \) follows a linear differential equation in the infinite-width limit, where the eigenfunctions of the Jacobian are the kernel principal components of the input data [8, 32]. This connection to kernel methods motivates early stopping to reduce overfitting [33].
*   **Numerical Investigation:** The theoretical results are investigated numerically using an artificial dataset and the MNIST dataset, observing that the behavior of wide ANNs is close to the theoretical limit [34, 35].

During training, the network function \( f_\theta \) descends along the kernel gradient with respect to the NTK, allowing the study of ANN training in the function space \( \mathcal{F} \) where the cost \( \mathcal{C} \) is convex [55, 56]. A time-dependent function $f(t)$ follows kernel gradient descent with respect to $K$ if it satisfies $\partial_t f(t) = -\nabla_K C|_{f(t)}$ [70]. Convergence to a critical point of $C$ is guaranteed if $K$ is positive definite, making the cost strictly decreasing except where $\| d|_{f(t)} \|_{p \text{ in}} = 0$ [72].

For ANNs trained with gradient descent, the network function $f_\theta$ evolves along the kernel gradient with respect to the NTK \( \Theta^{(L)}(\theta) \) [84]. In the infinite-width limit, the NTK becomes deterministic and constant during training [88]. As the network width approaches infinity, output functions tend to i.i.d. Gaussian processes with covariance \( \Sigma^{(L)} \), defined recursively [90, 91]. In the same limit, the NTK converges in probability to a deterministic limiting kernel \( \Theta^{(L)}_\infty \) [95, 97, 98].

The dynamics of \( f_\theta \) is described by \( \partial_t f_\theta(t) = \Phi_{\Theta^{(L)}_\infty \otimes \text{Id}_{n_L}} (\langle d_t, \cdot \rangle_{p \text{ in}}) \) [110]. The solution to the differential equation describing this behavior can be expressed using a map \( \Pi \), where \( f_t = f^* + e^{-t\Pi}(f_0 - f^*) \) [123]. The map \( \Pi \) has at most \( Nn_L \) positive eigenfunctions, which are the kernel principal components of the data with respect to the kernel \( K \) [127].

Decomposing the difference \( (f^* - f_0) \) along the eigenspaces of \( \Pi \), the trajectory of the function \( f_t \) is given by \( f_t = f^* + \Delta_0 f + \sum_{i=1}^{Nn_L} e^{-t\lambda_i} \Delta_i f \) [129]. This motivates early stopping, as convergence is faster along eigenspaces with larger eigenvalues \( \lambda_i \) [130, 131].

Numerical experiments compare ANNs of varying widths to the theoretical infinite-width limit, using the ReLU nonlinearity [138, 139]. Wider networks deviate less from the straight line, and the trajectory along the second principal component converges to the theoretical limit as width increases [178, 179].

In conclusion, the NTK describes the local dynamics of an ANN during gradient descent, establishing a connection between ANN training and kernel methods [185]. In the infinite-width limit, ANN gradient descent is equivalent to kernel gradient descent with respect to a constant kernel \( \Theta_{\infty}^{(L)} \) [186, 187].

`