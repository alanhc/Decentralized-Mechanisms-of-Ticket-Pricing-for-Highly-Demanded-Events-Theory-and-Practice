import numpy as np
def gen_data_normal(mu, sigma, buyers_n,percentage):
    mu = mu
    sigma = sigma
    n = buyers_n
    money = np.random.normal(mu, sigma, n)
    money = np.clip(money, 0, None)
    np.random.shuffle(money)
    buyers = np.full(n, 0)
    percentage_n=int(percentage/100*n)

    buyers[:percentage_n]=1
    np.random.shuffle(buyers)
    print(np.nonzero(buyers)[0].shape)
    return money, buyers
def gen_data_log_normal(mean, std_dev, buyers_n,percentage):
    # mean = 700
    # std_dev = 740.5633767431167 #548
    mu = np.log(mean**2 / np.sqrt(mean**2 + std_dev**2))
    sigma = np.sqrt(np.log(1 + (std_dev**2 / mean**2)))
    n = buyers_n
    money = np.random.lognormal(mu, sigma, n)
    np.random.shuffle(money)
    
    buyers = np.full(n, 0)
    percentage_n=int(percentage/100*n)

    buyers[:percentage_n]=1
    np.random.shuffle(buyers)
    print(np.nonzero(buyers)[0].shape)
    return money, buyers