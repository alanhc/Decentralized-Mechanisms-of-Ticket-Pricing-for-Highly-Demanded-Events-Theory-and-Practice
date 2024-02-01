import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import pandas as pd



def hist(data, bin_width, title, xaxis_title, yaxis_title):
    # Define the bin width and bin edges
    
    bin_edges = np.arange(min(data), max(data) + bin_width, bin_width)

    # Calculate the frequency counts for each bin
    counts, _ = np.histogram(data, bins=bin_edges)

    # Using Plotly Express to plot the histogram
    fig = px.histogram(x=bin_edges[:-1], y=counts, nbins=len(bin_edges))

    # Adding titles and labels
    fig.update_layout(
        title=title,
        xaxis_title=xaxis_title,
        yaxis_title=yaxis_title
    )
    # Display the plot
    return fig# fig.show()
def demand_curve(data, bin_width, title):
    # Define the bin width and bin edges
    bin_edges = np.arange(min(data), max(data) + bin_width, bin_width)

    # Calculate the frequency counts for each bin
    counts, _ = np.histogram(data, bins=bin_edges)
    prices = bin_edges[:-1]  # Prices are the left edges of each bin

    # Creating a DataFrame for plotting the demand curve
    df_demand = pd.DataFrame({
        'prices': prices,
        'quantity': counts  # Quantity sold at each price bin
    })
    df_demand.to_csv('data.csv')
    df_demand_filtered = df_demand[df_demand['quantity'] > 0]

    # Plotting the demand curve with Plotly
    # fig = px.line(df_demand_filtered, x='quantity', y='prices', title='Demand Curve for Ticket Prices')
    fig = px.scatter(df_demand_filtered, x="quantity", y="prices")
    fig.update_xaxes(title='Quantity(Ticket amount)')
    fig.update_yaxes(title='Price(Ticket price USD)')
    fig.update_layout(title=title)
    return fig
