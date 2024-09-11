import os

import settings as st
import rawdata2actions as rd

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)


# SESSION_CUT = 2
# modeling unit: ACTION
def main_ACTION():
    st.SESSION_CUT = 2
    print("***Computing training features")
    st.CASE = 'training'
    rd.process_files( st.CASE )
    print('***Evaluating on the test set')
    st.CASE = 'test'
    rd.process_files(st.CASE)
    return

main_ACTION()
