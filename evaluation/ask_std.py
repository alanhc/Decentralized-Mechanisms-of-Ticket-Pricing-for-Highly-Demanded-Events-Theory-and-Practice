# Given data for log-normal distribution
mean = 700  # average price
min_price = 50  # minimum price
max_price = 7000  # maximum price
q = 0.999
# For a log-normal distribution, the mean and standard deviation are not directly the mean and std dev of the data
# They are parameters of the underlying normal distribution of the log-transformed data

# We can't directly calculate the standard deviation of the log-normal distribution from the min, max, and mean of the data
# However, we can estimate the parameters of the underlying normal distribution (mu and sigma) and then calculate 
# the standard deviation of the log-normal distribution based on these estimates

# This estimation is very rough and should be taken with caution

# Estimate mu and sigma of the underlying normal distribution
# We'll use the formula for the mean of a log-normal distribution: exp(mu + sigma^2 / 2) = mean
# And we'll make a rough estimation that the max price (7000) is around the 99th percentile of the distribution

from scipy.stats import lognorm
import numpy as np

# Estimating the parameters of the underlying normal distribution
# We assume that the mean (700) of the log-normal distribution is exp(mu + sigma^2 / 2)
# We also assume that the max price (7000) is around the 99th percentile

# Since we have two equations, we can try to solve them numerically
def equations(p):
    mu, sigma = p
    return (np.exp(mu + sigma**2 / 2) - mean, 
            lognorm.cdf(max_price, s=sigma, scale=np.exp(mu)) - q)

from scipy.optimize import fsolve
# 初始猜測值
initial_guess = (np.log(mean), 1)
mu, sigma = fsolve(equations, initial_guess)

# Once we have mu and sigma, we can calculate the standard deviation of the log-normal distribution
std_dev_log_normal = np.sqrt((np.exp(sigma**2) - 1) * np.exp(2*mu + sigma**2))
print(mu, sigma, std_dev_log_normal)
