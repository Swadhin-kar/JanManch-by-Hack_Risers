import pandas as pd
import sys
import json
from textblob import TextBlob
import matplotlib.pyplot as plt
import io
import base64
from collections import defaultdict


def fig_to_base64(fig):
    """Converts a matplotlib figure to a base64 encoded PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_base64



def plot_agegroup_pie(data):
    """
    Generates a pie chart for reviews by age group.
    Age groups: <18, 18–40, >40
    """
  
    bins = [0, 17, 40, 200]
    labels = ["<18", "18–40", ">40"]
    data["AgeGroupCategory"] = pd.cut(data["AgeGroup"], bins=bins, labels=labels, right=True)

   
    age_counts = data["AgeGroupCategory"].value_counts().sort_index()


    fig, ax = plt.subplots(figsize=(6, 6))
    age_counts.plot.pie(
        autopct="%1.1f%%",
        startangle=90,
        ax=ax,
        title="Reviews by Age Group"
    )
    ax.set_ylabel("")
    ax.set_aspect("equal")

    plt.tight_layout()
    return fig

def plot_gender(data):
    """Generates three pie charts for reviews by gender."""
    review_counts = data.groupby(["Gender", "Review"]).size().unstack(fill_value=0)
    fig, axes = plt.subplots(1, 3, figsize=(10, 6))
    if "Positive" in review_counts.columns:
        review_counts["Positive"].plot.pie(autopct="%1.1f%%", ax=axes[0], title="Positive Reviews by Gender", wedgeprops={"width": 1}, startangle=90)
    if "Negative" in review_counts.columns:
        review_counts["Negative"].plot.pie(autopct="%1.1f%%", ax=axes[1], title="Negative Reviews by Gender", wedgeprops={"width": 1}, startangle=90)
    if "Neutral" in review_counts.columns:
        review_counts["Neutral"].plot.pie(autopct="%1.1f%%", ax=axes[2], title="Neutral Reviews by Gender", wedgeprops={"width": 1}, startangle=90)
    for ax in axes:
        ax.set_ylabel("")
        ax.set_aspect("equal")
    plt.tight_layout()
    return fig

def plot_profession(df):
    """Generates a bar chart of reviews by profession."""
    review_counts = df.groupby(["Profession", "Review"]).size().unstack(fill_value=0)
    fig, ax = plt.subplots(figsize=(12, 6))
    review_counts.plot(kind="bar", ax=ax)
    ax.set_title("Review Counts by Profession")
    ax.set_xlabel("Profession")
    ax.set_ylabel("Number of Reviews")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    return fig
    
def plot_overall_pie(data):
    """Generates a pie chart of overall review distribution."""
    review_counts = data["Review"].value_counts()
    fig, ax = plt.subplots(figsize=(7, 7))
    review_counts.plot.pie(autopct="%1.1f%%", ax=ax, startangle=90, colors=["green", "red", "gray"])
    ax.set_ylabel("")
    ax.set_title("Overall Reviews Distribution")
    ax.set_aspect("equal")
    plt.tight_layout()
    return fig

if __name__ == '__main__':
    try:
        payload_str = sys.argv[1]
        data = json.loads(payload_str)
        reviews = data.get('reviews', [])

        if not reviews:
            print(json.dumps({
                "overallReviewCount": 0,
                "overallSentiment": "Neutral",
                "pieChartData": {"Positive": 0, "Negative": 0, "Neutral": 0},
                "ageChart": "",
                "genderChart": "",
                "professionChart": "",
                "overallChart": ""
            }))
            sys.exit()

        processed_data = []
        for review in reviews:
            reason = review.get('reason', '')
            analysis = TextBlob(reason)
            sentiment = 'Positive' if analysis.sentiment.polarity > 0 else 'Negative' if analysis.sentiment.polarity < 0 else 'Neutral'
            
            processed_data.append({
                'Gender': review.get('gender'),
                'AgeGroup': review.get('age'),
                'Profession': review.get('profession'),
                'Review': sentiment
            })
        
        df = pd.DataFrame(processed_data)
        
        review_counts = df['Review'].value_counts().reindex(['Positive', 'Negative', 'Neutral'], fill_value=0)
        overall_sentiment = review_counts.idxmax() if not review_counts.empty else 'Neutral'
        
        age_chart_base64 = fig_to_base64(plot_agegroup_pie(df))
        gender_chart_base64 = fig_to_base64(plot_gender(df))
        profession_chart_base64 = fig_to_base64(plot_profession(df))
        overall_chart_base64 = fig_to_base64(plot_overall_pie(df))
        
        print(json.dumps({
            "overallReviewCount": int(df.shape[0]),
            "overallSentiment": overall_sentiment,
            "pieChartData": review_counts.to_dict(),
            "ageChart": age_chart_base64,
            "genderChart": gender_chart_base64,
            "professionChart": profession_chart_base64,
            "overallChart": overall_chart_base64
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1) 
        